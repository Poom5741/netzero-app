"""Tests for data/rest_client.py — Binance eapi REST client with retry logic."""
import asyncio
import pytest
from unittest.mock import AsyncMock, patch

from data.rest_client import BinanceRestClient, RetryableError


@pytest.fixture
def client():
    return BinanceRestClient(base_url="https://test.binance.com", max_retries=3)


def _mock_response(status=200, json_data=None):
    resp = AsyncMock()
    resp.status = status
    resp.json = AsyncMock(return_value=json_data or {})
    resp.release = AsyncMock()
    return resp


# --- Basic GET ---

async def test_get_success(client):
    client._raw_request = AsyncMock(return_value=_mock_response(200, {"data": "ok"}))
    result = await client._get("/eapi/v1/exchangeInfo")
    assert result == {"data": "ok"}


# --- Retry on 429 ---

async def test_retry_on_429(client):
    call_count = 0

    async def fake_request(method, url, **kwargs):
        nonlocal call_count
        call_count += 1
        if call_count < 3:
            return _mock_response(429)
        return _mock_response(200, {"result": "ok"})

    client._raw_request = fake_request
    result = await client._get("/eapi/v1/ticker")
    assert result == {"result": "ok"}
    assert call_count == 3


# --- Retry on 5xx ---

async def test_retry_on_500(client):
    call_count = 0

    async def fake_request(method, url, **kwargs):
        nonlocal call_count
        call_count += 1
        if call_count < 2:
            return _mock_response(500)
        return _mock_response(200, {"data": "recovered"})

    client._raw_request = fake_request
    result = await client._get("/eapi/v1/mark")
    assert result == {"data": "recovered"}
    assert call_count == 2


# --- Exhaust retries raises RetryableError ---

async def test_exhausted_retries_raises(client):
    client._raw_request = AsyncMock(return_value=_mock_response(503))
    with pytest.raises(RetryableError):
        await client._get("/eapi/v1/depth")


# --- Non-retryable 4xx returns immediately ---

async def test_no_retry_on_400(client):
    call_count = 0

    async def fake_request(method, url, **kwargs):
        nonlocal call_count
        call_count += 1
        return _mock_response(400, {"code": -1102, "msg": "bad request"})

    client._raw_request = fake_request
    with pytest.raises(Exception) as exc_info:
        await client._get("/eapi/v1/exchangeInfo")
    assert call_count == 1  # No retry
    assert "400" in str(exc_info.value)


# --- Endpoint methods ---

async def test_exchange_info(client):
    client._get = AsyncMock(return_value={"symbols": []})
    result = await client.get_exchange_info()
    client._get.assert_called_once_with("/eapi/v1/exchangeInfo")
    assert result == {"symbols": []}


async def test_get_mark_price(client):
    client._get = AsyncMock(return_value={"markPrice": "30000.0"})
    result = await client.get_mark_price(symbol="BTC-210924-30000-C")
    client._get.assert_called_once_with("/eapi/v1/mark", params={"symbol": "BTC-210924-30000-C"})


async def test_get_ticker(client):
    client._get = AsyncMock(return_value={"lastPrice": "1000"})
    result = await client.get_ticker(symbol="BTC-210924-30000-C")
    client._get.assert_called_once_with("/eapi/v1/ticker", params={"symbol": "BTC-210924-30000-C"})


async def test_get_depth(client):
    client._get = AsyncMock(return_value={"bids": [], "asks": []})
    result = await client.get_depth(symbol="BTC-210924-30000-C")
    client._get.assert_called_once_with("/eapi/v1/depth", params={"symbol": "BTC-210924-30000-C", "limit": 20})


# --- Exponential backoff timing ---

async def test_exponential_backoff_delays(client):
    """Verify sleep delays grow exponentially: 1s, 2s, 4s."""
    delays = []

    async def track_sleep(seconds):
        delays.append(seconds)

    call_count = 0

    async def fake_request(method, url, **kwargs):
        nonlocal call_count
        call_count += 1
        if call_count <= 3:
            return _mock_response(429)
        return _mock_response(200, {"ok": True})

    client._raw_request = fake_request
    with patch("data.rest_client.asyncio.sleep", side_effect=track_sleep):
        result = await client._get("/eapi/v1/ticker")

    assert result == {"ok": True}
    assert delays == [1.0, 2.0, 4.0]


# --- Session lifecycle ---

async def test_close_session(client):
    mock_session = AsyncMock()
    mock_session.closed = False
    client._session = mock_session
    await client.close()
    mock_session.close.assert_called_once()


async def test_close_no_session(client):
    """Closing without ever making a request should not raise."""
    await client.close()  # No session created yet — should be a no-op
