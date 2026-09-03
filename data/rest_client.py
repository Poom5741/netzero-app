"""Async Binance European Options REST client with retry logic.

POOM-205 owns the canonical client; this module provides the subset
needed by data_fetcher for discovery and filtering.
"""
from __future__ import annotations

import asyncio
import logging
from typing import Any

import aiohttp

logger = logging.getLogger(__name__)

BASE_URL = "https://eapi.binance.com"


class BinanceOptionsClient:
    """Async HTTP client for Binance European Options API."""

    def __init__(self, session: aiohttp.ClientSession | None = None, max_retries: int = 3):
        self._session = session
        self._max_retries = max_retries

    async def _get(self, path: str, params: dict | None = None) -> Any:
        """GET with exponential backoff retry for 429/5xx."""
        url = f"{BASE_URL}{path}"
        last_exc: Exception | None = None
        for attempt in range(self._max_retries):
            try:
                async with aiohttp.ClientSession() as session:
                    async with session.get(url, params=params, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                        if resp.status == 429:
                            retry_after = int(resp.headers.get("Retry-After", 2 ** attempt))
                            await asyncio.sleep(retry_after)
                            continue
                        if resp.status >= 500:
                            await asyncio.sleep(2 ** attempt)
                            continue
                        resp.raise_for_status()
                        return await resp.json()
            except (aiohttp.ClientError, asyncio.TimeoutError) as exc:
                last_exc = exc
                await asyncio.sleep(2 ** attempt)
        raise last_exc or ConnectionError("max retries exceeded")

    async def get_exchange_info(self) -> dict:
        """Fetch /eapi/v1/exchangeInfo."""
        return await self._get("/eapi/v1/exchangeInfo")

    async def get_ticker(self, symbol: str | None = None) -> list[dict]:
        """Fetch /eapi/v1/ticker."""
        params = {"symbol": symbol} if symbol else None
        return await self._get("/eapi/v1/ticker", params)
