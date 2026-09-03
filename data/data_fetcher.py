"""Discovery and filtering for active options.

Fetches /eapi/v1/exchangeInfo, filters by expiry ≤ 30 days,
filters out zero liquidity options (empty bid/ask),
and re-fetches exchange info every 5 minutes.
"""
from __future__ import annotations

import logging
import time
from typing import Any

from data.models import Option

logger = logging.getLogger(__name__)

EXPIRY_MAX_DAYS = 30
CACHE_TTL_SECONDS = 300  # 5 minutes


class DataFetcher:
    """Combines REST client with data models for option discovery."""

    def __init__(self, client: Any):
        self._client = client
        self._cache: list[Option] | None = None
        self._cache_ts: float = 0.0

    async def discover_options(self) -> list[Option]:
        """Discover active options: exchangeInfo + ticker → filtered Option list.

        Caches exchangeInfo for 5 minutes to avoid excessive API calls.
        Returns empty list on network errors.
        """
        try:
            now = time.time()
            if self._cache is not None and (now - self._cache_ts) < CACHE_TTL_SECONDS:
                return self._cache

            exchange_info = await self._client.get_exchange_info()
            options = await self._discover_from_exchange_info(exchange_info)

            # Filter out zero liquidity options
            liquid_options = await self._filter_liquidity(options)

            self._cache = liquid_options
            self._cache_ts = now
            return liquid_options
        except Exception as exc:
            logger.error("Discovery failed: %s", exc)
            return []

    async def _discover_from_exchange_info(self, exchange_info: dict) -> list[Option]:
        """Parse exchangeInfo and filter by expiry ≤ 30 days."""
        option_symbols = exchange_info.get("optionSymbols", [])
        now_ms = int(time.time() * 1000)
        max_expiry_ms = now_ms + (EXPIRY_MAX_DAYS * 24 * 60 * 60 * 1000)

        options: list[Option] = []
        for sym in option_symbols:
            expiry_ms = int(sym.get("expiryDate", 0))
            if expiry_ms > max_expiry_ms:
                continue

            option = Option(
                symbol=sym["symbol"],
                underlying=sym.get("underlying", ""),
                strike=float(sym.get("strikePrice", 0)),
                expiry=expiry_ms,
                type=sym.get("type", ""),
                unit=float(sym.get("unit", 1)),
                contract_size=float(sym.get("contractSize", 1)),
                quote_asset=sym.get("quoteAsset", "USDT"),
                base_asset=sym.get("baseAsset", "BTC"),
                status=sym.get("status", "TRADING"),
            )
            options.append(option)

        return options

    async def _filter_liquidity(self, options: list[Option]) -> list[Option]:
        """Filter out options with zero liquidity (empty bid/ask)."""
        if not options:
            return []

        try:
            ticker_data = await self._client.get_ticker()
        except Exception as exc:
            logger.warning("Ticker fetch failed, returning all options: %s", exc)
            return options

        # Build a map of symbol → (bid, ask)
        liquidity_map: dict[str, tuple[float, float]] = {}
        for t in ticker_data:
            symbol = t.get("symbol", "")
            bid = float(t.get("bidPrice", 0))
            ask = float(t.get("askPrice", 0))
            liquidity_map[symbol] = (bid, ask)

        liquid_options: list[Option] = []
        for opt in options:
            bid, ask = liquidity_map.get(opt.symbol, (0.0, 0.0))
            if bid > 0 and ask > 0:
                liquid_options.append(opt)

        return liquid_options
