"""Immutable data models for Binance European Options.

ponytail: matches POOM-206 contract. If that task defines richer fields,
merge here; the data_fetcher only uses symbol/strike/expiry/type/bid/ask/last/mark.
"""
from dataclasses import dataclass


@dataclass(frozen=True)
class Option:
    symbol: str
    strike: float
    expiry: int  # ms timestamp
    type: str  # "CALL" | "PUT"


@dataclass(frozen=True)
class Quote:
    bid: float
    ask: float
    last: float
    mark: float


@dataclass(frozen=True)
class Greeks:
    delta: float
    gamma: float
    theta: float
    vega: float
    iv: float
