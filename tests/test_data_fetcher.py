"""Tests for discovery and filtering logic in data_fetcher."""
import asyncio
from datetime import datetime, timedelta, timezone
from unittest.mock import AsyncMock, MagicMock

import pytest

from data.data_fetcher import DataFetcher
from data.models import Option


# --- Fixtures ---

def _now_ts() -> int:
    return int(datetime.now(tz=timezone.utc).timestamp() * 1000)


def _ts_offset(days: float) -> str:
    """Return an expiryDate timestamp (ms) string offset from now by `days`."""
    ts = int((datetime.now(tz=timezone.utc) + timedelta(days=days)).timestamp() * 1000)
    return str(ts)


def _exchange_info_payload(symbols: list[dict]) -> dict:
    return {"optionSymbols": symbols}


def _symbol(
    symbol: str = "BTC-01JAN25-50000-C",
    expiry_days: float = 7.0,
    strike: str = "50000",
    opt_type: str = "CALL",
    status: str = "TRADING",
) -> dict:
    return {
        "symbol": symbol,
        "contractId": 1,
        "underlying": "BTCUSDT",
        "strikePrice": strike,
        "expiryDate": _ts_offset(expiry_days),
        "type": opt_type,
        "unit": "1",
        "contractSize": "1",
        "quoteAsset": "USDT",
        "baseAsset": "BTC",
        "marginAsset": "USDT",
        "riskFreeRate": "0.01",
        "makerFeeRate": "0.0003",
        "takerFeeRate": "0.001",
        "underlyingType": "COIN",
        "status": status,
    }


# --- Expiry filtering ---

@pytest.mark.asyncio
async def test_filter_by_expiry_removes_far_expiry_options():
    """Options with expiry > 30 days should be filtered out."""
    payload = _exchange_info_payload([
        _symbol("BTC-NEAR-50000-C", expiry_days=5.0),
        _symbol("BTC-FAR-50000-C", expiry_days=45.0),
    ])
    fetcher = DataFetcher(client=MagicMock())
    symbols = await fetcher._discover_from_exchange_info(payload)

    near = [s for s in symbols if s.symbol == "BTC-NEAR-50000-C"]
    far = [s for s in symbols if s.symbol == "BTC-FAR-50000-C"]
    assert len(near) == 1, "near-expiry option should be kept"
    assert len(far) == 0, "far-expiry option should be filtered out"


@pytest.mark.asyncio
async def test_filter_by_expiry_keeps_exactly_30_days():
    """Options expiring exactly at 30-day boundary should be kept (inclusive)."""
    payload = _exchange_info_payload([
        _symbol("BTC-30D-50000-C", expiry_days=30.0),
    ])
    fetcher = DataFetcher(client=MagicMock())
    symbols = await fetcher._discover_from_exchange_info(payload)
    assert len(symbols) == 1


# --- Zero liquidity filtering ---

@pytest.mark.asyncio
async def test_filter_zero_liquidity_rejects_empty_bid_ask():
    """Options with empty/zero bid and ask should be filtered out."""
    ticker_resp = [
        {"symbol": "BTC-LIQ-50000-C", "bidPrice": "0", "bidQty": "0", "askPrice": "0", "askQty": "0"},
        {"symbol": "BTC-WITH-50000-C", "bidPrice": "100.5", "bidQty": "0.1", "askPrice": "101.0", "askQty": "0.1"},
    ]
    payload = _exchange_info_payload([
        _symbol("BTC-LIQ-50000-C", expiry_days=5.0),
        _symbol("BTC-WITH-50000-C", expiry_days=5.0),
    ])

    client = MagicMock()
    client.get_exchange_info = AsyncMock(return_value=payload)
    client.get_ticker = AsyncMock(return_value=ticker_resp)
    fetcher = DataFetcher(client=client)

    options = await fetcher.discover_options()

    symbols = [o.symbol for o in options]
    assert "BTC-LIQ-50000-C" not in symbols, "zero-liquidity option must be rejected"
    assert "BTC-WITH-50000-C" in symbols, "liquid option must be kept"


# --- Discovery integration ---

@pytest.mark.asyncio
async def test_discover_options_returns_filtered_list():
    """Full discovery flow: exchangeInfo + ticker → filtered Option list."""
    payload = _exchange_info_payload([
        _symbol("BTC-A-50000-C", expiry_days=10.0),
        _symbol("BTC-B-40000-P", expiry_days=10.0),
    ])
    ticker_resp = [
        {"symbol": "BTC-A-50000-C", "bidPrice": "100", "bidQty": "0.1", "askPrice": "101", "askQty": "0.1"},
        {"symbol": "BTC-B-40000-P", "bidPrice": "1", "bidQty": "0.01", "askPrice": "2", "askQty": "0.01"},
    ]
    client = MagicMock()
    client.get_exchange_info = AsyncMock(return_value=payload)
    client.get_ticker = AsyncMock(return_value=ticker_resp)
    fetcher = DataFetcher(client=client)

    options = await fetcher.discover_options()
    assert len(options) == 2
    assert all(isinstance(o, Option) for o in options)
    assert {o.symbol for o in options} == {"BTC-A-50000-C", "BTC-B-40000-P"}


# --- 5-minute cache / re-fetch ---

@pytest.mark.asyncio
async def test_exchange_info_cached_for_5_minutes():
    """exchangeInfo should not be re-fetched within 5 minutes."""
    payload = _exchange_info_payload([_symbol("BTC-C-50000-C", expiry_days=5.0)])
    ticker_resp = [
        {"symbol": "BTC-C-50000-C", "bidPrice": "100", "bidQty": "0.1", "askPrice": "101", "askQty": "0.1"},
    ]
    client = MagicMock()
    client.get_exchange_info = AsyncMock(return_value=payload)
    client.get_ticker = AsyncMock(return_value=ticker_resp)
    fetcher = DataFetcher(client=client)

    await fetcher.discover_options()
    await fetcher.discover_options()  # within 5-min window

    assert client.get_exchange_info.call_count == 1, "exchangeInfo must be cached"


# --- Error handling ---

@pytest.mark.asyncio
async def test_network_error_returns_empty_list():
    """Network errors during discovery should return empty list, not raise."""
    client = MagicMock()
    client.get_exchange_info = AsyncMock(side_effect=ConnectionError("network down"))
    fetcher = DataFetcher(client=client)

    options = await fetcher.discover_options()
    assert options == []


@pytest.mark.asyncio
async def test_empty_exchange_info_returns_empty():
    payload = _exchange_info_payload([])
    client = MagicMock()
    client.get_exchange_info = AsyncMock(return_value=payload)
    fetcher = DataFetcher(client=client)

    options = await fetcher.discover_options()
    assert options == []
