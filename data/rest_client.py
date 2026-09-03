"""Binance European Options (eapi) async REST client with exponential backoff retry."""
import asyncio
from typing import Any, Optional

import aiohttp


class RetryableError(Exception):
    """Raised when all retry attempts are exhausted for 429/5xx errors."""


class BinanceRestClient:
    """Async HTTP client for Binance eapi with automatic retry on 429/5xx.

    Session is created lazily inside the first request so the client can be
    instantiated outside an event loop (e.g. in test fixtures).
    """

    BASE_URL = "https://eapi.binance.com"

    def __init__(
        self,
        base_url: str = BASE_URL,
        max_retries: int = 3,
        base_delay: float = 1.0,
        timeout: float = 10.0,
    ):
        self._base_url = base_url.rstrip("/")
        self._max_retries = max_retries
        self._base_delay = base_delay
        self._timeout = timeout
        self._session: Optional[aiohttp.ClientSession] = None

    def _ensure_session(self) -> aiohttp.ClientSession:
        if self._session is None or self._session.closed:
            self._session = aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=self._timeout)
            )
        return self._session

    async def close(self) -> None:
        if self._session and not self._session.closed:
            await self._session.close()

    # --- Public endpoint methods ---

    async def get_exchange_info(self) -> dict[str, Any]:
        return await self._get("/eapi/v1/exchangeInfo")

    async def get_mark_price(self, symbol: Optional[str] = None) -> Any:
        params = {"symbol": symbol} if symbol else None
        return await self._get("/eapi/v1/mark", params=params)

    async def get_ticker(self, symbol: Optional[str] = None) -> Any:
        params = {"symbol": symbol} if symbol else None
        return await self._get("/eapi/v1/ticker", params=params)

    async def get_depth(self, symbol: str, limit: int = 20) -> dict[str, Any]:
        return await self._get("/eapi/v1/depth", params={"symbol": symbol, "limit": limit})

    # --- Internal ---

    async def _get(self, path: str, params: Optional[dict] = None) -> Any:
        url = f"{self._base_url}{path}"
        last_exc = None
        for attempt in range(self._max_retries + 1):
            resp = await self._raw_request("GET", url, params=params)
            try:
                if resp.status == 200:
                    return await resp.json()
                if resp.status in (429, 500, 502, 503, 504):
                    if attempt < self._max_retries:
                        delay = self._base_delay * (2 ** attempt)
                        await asyncio.sleep(delay)
                        continue
                    raise RetryableError(
                        f"HTTP {resp.status} after {self._max_retries + 1} attempts"
                    )
                # Non-retryable 4xx — surface the Binance error body
                body = await resp.json()
                raise Exception(f"HTTP {resp.status}: {body}")
            finally:
                await resp.release()

    async def _raw_request(self, method: str, url: str, **kwargs) -> aiohttp.ClientResponse:
        """Thin wrapper around session.request — exists so tests can override it."""
        session = self._ensure_session()
        return await session.request(method, url, **kwargs)
