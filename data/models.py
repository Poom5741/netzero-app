"""Frozen dataclasses for Binance European Options data.

POOM-206 owns the canonical models; this module provides the subset
needed by data_fetcher for discovery and filtering.
"""
from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class Option:
    """An option contract from exchangeInfo."""
    symbol: str
    underlying: str
    strike: float
    expiry: int          # milliseconds timestamp
    type: str            # "CALL" or "PUT"
    unit: float = 1.0
    contract_size: float = 1.0
    quote_asset: str = "USDT"
    base_asset: str = "BTC"
    status: str = "TRADING"


@dataclass(frozen=True)
class Quote:
    """Live quote for an option symbol."""
    symbol: str
    bid: float
    ask: float
    last: float = 0.0
    mark: float = 0.0


@dataclass(frozen=True)
class Greeks:
    """Black-Scholes greeks for an option."""
    symbol: str
    delta: float = 0.0
    gamma: float = 0.0
    theta: float = 0.0
    vega: float = 0.0
    iv: float = 0.0
