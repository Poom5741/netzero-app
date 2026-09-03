"""2-leg strategy combinator with bias control.

Generates bull call spreads, bear put spreads, straddles, and strangles
from an option chain. Bias filtering: bullish → bull call spreads,
bearish → bear put spreads, sideways → straddles/strangles.
"""
from dataclasses import dataclass, field
from typing import Optional

import numpy as np

BULL_BIAS = "bull"
BEAR_BIAS = "bear"
SIDEWAY_BIAS = "sideways"
ALL_BIASES = [BULL_BIAS, BEAR_BIAS, SIDEWAY_BIAS]


@dataclass
class Leg:
    """One leg of a strategy."""
    option_type: str  # 'call' or 'put'
    strike: float
    premium: float
    long: bool  # True = long (paid premium), False = short (received premium)

    def payoff(self, S: float) -> float:
        """Payoff at expiry for underlying price S, net of premium."""
        if self.option_type == "call":
            intrinsic = max(S - self.strike, 0.0)
        else:
            intrinsic = max(self.strike - S, 0.0)
        if self.long:
            return intrinsic - self.premium
        else:
            return -intrinsic + self.premium


@dataclass
class Strategy:
    """A 2-leg options strategy."""
    identifier: str
    bias: str
    kind: str  # 'bull_call_spread' | 'bear_put_spread' | 'straddle' | 'strangle'
    legs: list[Leg] = field(default_factory=list)
    net_debit: float = 0.0
    max_profit: float = 0.0
    max_loss: float = 0.0


def generate_strategies(
    strikes: np.ndarray,
    call_premiums: np.ndarray,
    put_premiums: np.ndarray,
    spot: float,
    bias: Optional[str] = None,
    max_debit: float = 60.0,
) -> list[Strategy]:
    """Generate 2-leg strategies from an option chain.

    Args:
        strikes: Sorted strike prices (ascending).
        call_premiums: Call premiums at each strike.
        put_premiums: Put premiums at each strike.
        spot: Current underlying price.
        bias: Filter to one bias (BULL_BIAS, BEAR_BIAS, SIDEWAY_BIAS), or None for all.
        max_debit: Reject strategies with net_debit > max_debit (capital constraint).

    Returns:
        List of Strategy objects.
    """
    strikes = np.asarray(strikes, dtype=float)
    call_p = np.asarray(call_premiums, dtype=float)
    put_p = np.asarray(put_premiums, dtype=float)
    n = len(strikes)

    strategies = []

    if bias is None or bias == BULL_BIAS:
        strategies.extend(_bull_call_spreads(strikes, call_p, n, max_debit))

    if bias is None or bias == BEAR_BIAS:
        strategies.extend(_bear_put_spreads(strikes, put_p, n, max_debit))

    if bias is None or bias == SIDEWAY_BIAS:
        strategies.extend(_straddles(strikes, call_p, put_p, n, max_debit))
        strategies.extend(_strangles(strikes, call_p, put_p, n, max_debit))

    return strategies


def _bull_call_spreads(strikes, call_p, n, max_debit):
    """Long call at lower strike, short call at higher strike."""
    strategies = []
    for i in range(n):
        for j in range(i + 1, n):
            long_leg = Leg("call", strikes[i], call_p[i], long=True)
            short_leg = Leg("call", strikes[j], call_p[j], long=False)
            net_debit = call_p[i] - call_p[j]
            if net_debit > max_debit or net_debit < 0:
                continue
            max_profit = (strikes[j] - strikes[i]) - net_debit
            strategies.append(
                Strategy(
                    identifier=f"bcs_{strikes[i]}_{strikes[j]}",
                    bias=BULL_BIAS,
                    kind="bull_call_spread",
                    legs=[long_leg, short_leg],
                    net_debit=net_debit,
                    max_profit=max_profit,
                    max_loss=net_debit,
                )
            )
    return strategies


def _bear_put_spreads(strikes, put_p, n, max_debit):
    """Long put at higher strike, short put at lower strike."""
    strategies = []
    for i in range(n):
        for j in range(i + 1, n):
            long_leg = Leg("put", strikes[j], put_p[j], long=True)
            short_leg = Leg("put", strikes[i], put_p[i], long=False)
            net_debit = put_p[j] - put_p[i]
            if net_debit > max_debit or net_debit < 0:
                continue
            max_profit = (strikes[j] - strikes[i]) - net_debit
            strategies.append(
                Strategy(
                    identifier=f"bps_{strikes[i]}_{strikes[j]}",
                    bias=BEAR_BIAS,
                    kind="bear_put_spread",
                    legs=[long_leg, short_leg],
                    net_debit=net_debit,
                    max_profit=max_profit,
                    max_loss=net_debit,
                )
            )
    return strategies


def _straddles(strikes, call_p, put_p, n, max_debit):
    """Long call + long put at same strike."""
    strategies = []
    for i in range(n):
        long_call = Leg("call", strikes[i], call_p[i], long=True)
        long_put = Leg("put", strikes[i], put_p[i], long=True)
        net_debit = call_p[i] + put_p[i]
        if net_debit > max_debit:
            continue
        strategies.append(
            Strategy(
                identifier=f"strd_{strikes[i]}",
                bias=SIDEWAY_BIAS,
                kind="straddle",
                legs=[long_call, long_put],
                net_debit=net_debit,
                max_profit=float("inf"),
                max_loss=net_debit,
            )
        )
    return strategies


def _strangles(strikes, call_p, put_p, n, max_debit):
    """Long OTM call + long OTM put at different strikes."""
    strategies = []
    for i in range(n):
        for j in range(n):
            if i == j:
                continue
            long_call = Leg("call", strikes[i], call_p[i], long=True)
            long_put = Leg("put", strikes[j], put_p[j], long=True)
            net_debit = call_p[i] + put_p[j]
            if net_debit > max_debit:
                continue
            strategies.append(
                Strategy(
                    identifier=f"stgl_{strikes[i]}_{strikes[j]}",
                    bias=SIDEWAY_BIAS,
                    kind="strangle",
                    legs=[long_call, long_put],
                    net_debit=net_debit,
                    max_profit=float("inf"),
                    max_loss=net_debit,
                )
            )
    return strategies
