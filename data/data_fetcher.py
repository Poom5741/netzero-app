"""Data fetcher: combines REST client + models for high-level option data access.

ponytail: assumes BinanceRestClient.get(path, params) -> dict|list.
If the client gains session lifecycle (close/aclose), wire it into an async context manager.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from data.models import Option, Quote


@dataclass(frozen=True)
class OptionInfo:
    """Composite: one option's identity + its current market quote."""
    option: Option
    quote: Quote


class DataFetcher:
    """Fetches and parses Binance eapi option data into typed models."""

    def __init__(self, client: Any) -> None:
        self._client = client

    async def discover_underlyings(self) -> list[str]:
        """Return available underlying assets (e.g. ['BTC', 'ETH'])."""
        info = await self._client.get("/eapi/v1/exchangeInfo")
        return [a["name"] for a in info["optionAssets"]]

    async def fetch_expiry_dates(self, underlying: str) -> list[int]:
        """Return distinct expiry timestamps for an underlying."""
        info = await self._client.get("/eapi/v1/exchangeInfo")
        return sorted({
            s["expiryDate"]
            for s in info["optionSymbols"]
            if s["underlying"] == underlying
        })

    async def fetch_option_chain(self, underlying: str, expiry: int) -> list[OptionInfo]:
        """Fetch full option chain for underlying+expiry. Filters zero-liquidity."""
        info, tickers = await self._gather_chain_data(underlying, expiry)

        ticker_map = {t["symbol"]: t for t in tickers}
        results: list[OptionInfo] = []

        for sym_def in info["optionSymbols"]:
            if sym_def["underlying"] != underlying or sym_def["expiryDate"] != expiry:
                continue
            ticker = ticker_map.get(sym_def["symbol"])
            if not ticker:
                continue
            quote = _parse_quote(ticker)
            if quote.bid == 0 and quote.ask == 0:
                continue  # zero liquidity
            option = Option(
                symbol=sym_def["symbol"],
                strike=float(sym_def["strikePrice"]),
                expiry=sym_def["expiryDate"],
                type=sym_def["type"],
            )
            results.append(OptionInfo(option=option, quote=quote))

        return results

    async def fetch_depth(self, symbol: str) -> Quote:
        """Fetch order book top-of-book as a Quote."""
        data = await self._client.get("/eapi/v1/depth", {"symbol": symbol})
        bid = float(data["bids"][0][0]) if data.get("bids") else 0.0
        ask = float(data["asks"][0][0]) if data.get("asks") else 0.0
        return Quote(bid=bid, ask=ask, last=0.0, mark=0.0)

    @staticmethod
    def calculate_cost(premium: float, quantity: float, unit: float = 1.0) -> float:
        """Cost = premium × unit × quantity."""
        return premium * unit * quantity

    # --- internal ---

    async def _gather_chain_data(self, underlying: str, expiry: int):
        """Fetch exchange info + ticker in sequence. ponytail: parallelize with asyncio.gather when latency matters."""
        info = await self._client.get("/eapi/v1/exchangeInfo")
        tickers = await self._client.get("/eapi/v1/ticker", {"underlying": underlying, "expiry": expiry})
        return info, tickers


def _parse_quote(ticker: dict) -> Quote:
    return Quote(
        bid=float(ticker.get("bidPrice", 0)),
        ask=float(ticker.get("askPrice", 0)),
        last=float(ticker.get("lastPrice", 0)),
        mark=float(ticker.get("markPrice", 0)),
    )
