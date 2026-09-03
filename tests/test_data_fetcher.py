"""Tests for data/data_fetcher.py — TDD, mock REST responses."""
import asyncio
import pytest
from unittest.mock import AsyncMock, MagicMock

from data.data_fetcher import DataFetcher, OptionInfo
from data.models import Option, Quote, Greeks


# --- Fixtures / helpers ---

def _make_client(get_side_effect=None, get_return=None):
    """Create a mock BinanceRestClient."""
    client = MagicMock()
    client.get = AsyncMock()
    if get_side_effect is not None:
        client.get.side_effect = get_side_effect
    elif get_return is not None:
        client.get.return_value = get_return
    return client


EXCHANGE_INFO_RESPONSE = {
    "optionAssets": [{"id": "BTC", "name": "BTC"}],
    "optionSymbols": [
        {
            "symbol": "BTC-260925-80000-C",
            "underlying": "BTC",
            "strikePrice": "80000",
            "expiryDate": 1758787200000,
            "type": "CALL",
            "unit": 1,
            "minQty": "0.01",
            "maxQty": "100",
        },
        {
            "symbol": "BTC-260925-80000-P",
            "underlying": "BTC",
            "strikePrice": "80000",
            "expiryDate": 1758787200000,
            "type": "PUT",
            "unit": 1,
            "minQty": "0.01",
            "maxQty": "100",
        },
        {
            "symbol": "BTC-260925-90000-C",
            "underlying": "BTC",
            "strikePrice": "90000",
            "expiryDate": 1758787200000,
            "type": "CALL",
            "unit": 1,
            "minQty": "0.01",
            "maxQty": "100",
        },
    ],
}

TICKER_RESPONSE = [
    {"symbol": "BTC-260925-80000-C", "lastPrice": "5000", "bidPrice": "4900", "askPrice": "5100", "markPrice": "5050"},
    {"symbol": "BTC-260925-80000-P", "lastPrice": "3000", "bidPrice": "2900", "askPrice": "3100", "markPrice": "3050"},
    {"symbol": "BTC-260925-90000-C", "lastPrice": "0", "bidPrice": "0", "askPrice": "0", "markPrice": "100"},
]

DEPTH_RESPONSE = {
    "symbol": "BTC-260925-80000-C",
    "bids": [["4900", "0.5"], ["4800", "1.0"]],
    "asks": [["5100", "0.3"], ["5200", "0.8"]],
}


# --- Tests: discover_underlyings ---

@pytest.mark.asyncio
async def test_discover_underlyings():
    client = _make_client(get_return=EXCHANGE_INFO_RESPONSE)
    fetcher = DataFetcher(client)
    underlyings = await fetcher.discover_underlyings()
    assert underlyings == ["BTC"]
    client.get.assert_awaited_once_with("/eapi/v1/exchangeInfo")


# --- Tests: fetch_expiry_dates ---

@pytest.mark.asyncio
async def test_fetch_expiry_dates():
    client = _make_client(get_return=EXCHANGE_INFO_RESPONSE)
    fetcher = DataFetcher(client)
    dates = await fetcher.fetch_expiry_dates("BTC")
    assert dates == [1758787200000]


@pytest.mark.asyncio
async def test_fetch_expiry_dates_filters_underlying():
    resp = {
        "optionAssets": [],
        "optionSymbols": [
            {"symbol": "ETH-260925-3000-C", "underlying": "ETH", "strikePrice": "3000",
             "expiryDate": 1758787200000, "type": "CALL", "unit": 1, "minQty": "0.01", "maxQty": "100"},
            {"symbol": "BTC-260925-80000-C", "underlying": "BTC", "strikePrice": "80000",
             "expiryDate": 1758787200000, "type": "CALL", "unit": 1, "minQty": "0.01", "maxQty": "100"},
        ],
    }
    client = _make_client(get_return=resp)
    fetcher = DataFetcher(client)
    dates = await fetcher.fetch_expiry_dates("ETH")
    assert dates == [1758787200000]


# --- Tests: fetch_option_chain ---

@pytest.mark.asyncio
async def test_fetch_option_chain_parses_correctly():
    """Ticker + exchange info combine into OptionInfo objects."""
    async def mock_get(path, params=None):
        if path == "/eapi/v1/exchangeInfo":
            return EXCHANGE_INFO_RESPONSE
        if path == "/eapi/v1/ticker":
            return TICKER_RESPONSE
        return []

    client = _make_client(get_side_effect=mock_get)
    fetcher = DataFetcher(client)
    chain = await fetcher.fetch_option_chain("BTC", 1758787200000)

    # Zero-liquidity (BTC-260925-90000-C with bid=0, ask=0) should be filtered out
    assert len(chain) == 2

    call = next(c for c in chain if c.option.symbol == "BTC-260925-80000-C")
    assert call.option.strike == 80000.0
    assert call.option.type == "CALL"
    assert call.option.expiry == 1758787200000
    assert call.quote.bid == 4900.0
    assert call.quote.ask == 5100.0
    assert call.quote.last == 5000.0
    assert call.quote.mark == 5050.0

    put = next(c for c in chain if c.option.symbol == "BTC-260925-80000-P")
    assert put.option.type == "PUT"
    assert put.quote.bid == 2900.0


@pytest.mark.asyncio
async def test_fetch_option_chain_filters_zero_liquidity():
    """Options with empty bid/ask (zero liquidity) must be filtered out."""
    async def mock_get(path, params=None):
        if path == "/eapi/v1/exchangeInfo":
            return EXCHANGE_INFO_RESPONSE
        if path == "/eapi/v1/ticker":
            return TICKER_RESPONSE
        return []

    client = _make_client(get_side_effect=mock_get)
    fetcher = DataFetcher(client)
    chain = await fetcher.fetch_option_chain("BTC", 1758787200000)

    symbols = [c.option.symbol for c in chain]
    assert "BTC-260925-90000-C" not in symbols


@pytest.mark.asyncio
async def test_fetch_option_chain_empty_ticker():
    """Empty ticker response returns empty chain."""
    async def mock_get(path, params=None):
        if path == "/eapi/v1/exchangeInfo":
            return EXCHANGE_INFO_RESPONSE
        if path == "/eapi/v1/ticker":
            return []
        return []

    client = _make_client(get_side_effect=mock_get)
    fetcher = DataFetcher(client)
    chain = await fetcher.fetch_option_chain("BTC", 1758787200000)
    assert chain == []


# --- Tests: fetch_depth ---

@pytest.mark.asyncio
async def test_fetch_depth_parses_order_book():
    client = _make_client(get_return=DEPTH_RESPONSE)
    fetcher = DataFetcher(client)
    quote = await fetcher.fetch_depth("BTC-260925-80000-C")

    assert quote.bid == 4900.0
    assert quote.ask == 5100.0


@pytest.mark.asyncio
async def test_fetch_depth_empty_book():
    """Empty order book returns zero quotes."""
    client = _make_client(get_return={"symbol": "X", "bids": [], "asks": []})
    fetcher = DataFetcher(client)
    quote = await fetcher.fetch_depth("X")
    assert quote.bid == 0.0
    assert quote.ask == 0.0


# --- Tests: calculate_cost ---

def test_calculate_cost_basic():
    """Cost = premium × unit × quantity."""
    assert DataFetcher.calculate_cost(premium=5000, quantity=0.01) == 50.0


def test_calculate_cost_unit_default():
    """Default unit=1."""
    assert DataFetcher.calculate_cost(premium=100, quantity=1) == 100.0


def test_calculate_cost_custom_unit():
    assert DataFetcher.calculate_cost(premium=100, quantity=2, unit=0.5) == 100.0


def test_calculate_cost_zero_quantity():
    assert DataFetcher.calculate_cost(premium=5000, quantity=0) == 0.0


# --- Tests: error handling ---

@pytest.mark.asyncio
async def test_fetch_option_chain_api_error_propagates():
    """API errors propagate (retry logic is in the REST client, not here)."""
    client = _make_client(get_side_effect=Exception("connection timeout"))
    fetcher = DataFetcher(client)
    with pytest.raises(Exception, match="connection timeout"):
        await fetcher.fetch_option_chain("BTC", 1758787200000)


@pytest.mark.asyncio
async def test_discover_underlyings_malformed_response():
    """Malformed response raises a clear error."""
    client = _make_client(get_return={"unexpected_key": "value"})
    fetcher = DataFetcher(client)
    with pytest.raises((KeyError, ValueError)):
        await fetcher.discover_underlyings()


# --- Tests: OptionInfo composite ---

def test_option_info_is_composite():
    """OptionInfo bundles Option + Quote."""
    opt = Option(symbol="BTC-260925-80000-C", strike=80000.0, expiry=1758787200000, type="CALL")
    q = Quote(bid=4900.0, ask=5100.0, last=5000.0, mark=5050.0)
    info = OptionInfo(option=opt, quote=q)
    assert info.option.symbol == "BTC-260925-80000-C"
    assert info.quote.bid == 4900.0
