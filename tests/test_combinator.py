"""TDD tests for the 2-leg strategy combinator."""
import numpy as np
import pytest

from engine.combinator import (
    Leg,
    Strategy,
    generate_strategies,
    BULL_BIAS,
    BEAR_BIAS,
    SIDEWAY_BIAS,
    ALL_BIASES,
)


# Fixtures -------------------------------------------------------------

@pytest.fixture
def chain():
    """A small, sorted option chain at fixed expiration.

    spot = 100, strikes 90/95/100/105/110.
    Premiums chosen so that vanilla spreads are debit (long premium > short
    premium) for the structured direction.
    """
    strikes = np.array([90.0, 95.0, 100.0, 105.0, 110.0])
    # Calls decay with strike (higher strike -> cheaper) for ITM/OTM realism.
    call_p = np.array([12.0, 8.0, 5.0, 2.5, 1.0])
    # Puts grow with strike.
    put_p = np.array([0.5, 1.5, 4.0, 7.0, 11.0])
    return strikes, call_p, put_p, 100.0


# Strategy generation --------------------------------------------------

def test_generate_returns_strategies(chain):
    strikes, call_p, put_p, spot = chain
    strategies = generate_strategies(strikes, call_p, put_p, spot, bias=None)
    assert len(strategies) > 0
    assert all(isinstance(s, Strategy) for s in strategies)


def test_all_strategies_are_two_legged(chain):
    strikes, call_p, put_p, spot = chain
    strategies = generate_strategies(strikes, call_p, put_p, spot, bias=None)
    assert all(len(s.legs) == 2 for s in strategies)


def test_no_same_strike_same_type_combos(chain):
    """Same-strike long+short of the same option type is invalid."""
    strikes, call_p, put_p, spot = chain
    strategies = generate_strategies(strikes, call_p, put_p, spot, bias=None)
    for s in strategies:
        # Group legs by option type; no type should have duplicate strikes
        by_type: dict[str, list[float]] = {}
        for leg in s.legs:
            by_type.setdefault(leg.option_type, []).append(leg.strike)
        for opt_type, legs_strikes in by_type.items():
            assert len(legs_strikes) == len(set(legs_strikes)), (
                f"{s.kind} has duplicate {opt_type} strikes"
            )


def test_bull_call_spreads_have_lower_long_higher_short(chain):
    strikes, call_p, put_p, spot = chain
    strategies = generate_strategies(strikes, call_p, put_p, spot, bias=BULL_BIAS)
    assert all(s.kind == "bull_call_spread" for s in strategies)
    assert all(s.bias == "bull" for s in strategies)
    for s in strategies:
        long_leg = next(l for l in s.legs if l.long)
        short_leg = next(l for l in s.legs if not l.long)
        assert long_leg.option_type == "call"
        assert short_leg.option_type == "call"
        assert long_leg.strike < short_leg.strike


def test_bear_put_spreads_have_higher_long_lower_short(chain):
    strikes, call_p, put_p, spot = chain
    strategies = generate_strategies(strikes, call_p, put_p, spot, bias=BEAR_BIAS)
    assert all(s.kind == "bear_put_spread" for s in strategies)
    assert all(s.bias == "bear" for s in strategies)
    for s in strategies:
        long_leg = next(l for l in s.legs if l.long)
        short_leg = next(l for l in s.legs if not l.long)
        assert long_leg.option_type == "put"
        assert short_leg.option_type == "put"
        assert long_leg.strike > short_leg.strike


def test_sideways_generates_straddles_and_strangles(chain):
    strikes, call_p, put_p, spot = chain
    strategies = generate_strategies(strikes, call_p, put_p, spot, bias=SIDEWAY_BIAS)
    kinds = {s.kind for s in strategies}
    assert kinds <= {"straddle", "strangle"}
    assert all(s.bias == "sideways" for s in strategies)
    for s in strategies:
        assert all(l.long for l in s.legs), "sideways = long vol only"
        if s.kind == "straddle":
            assert s.legs[0].strike == s.legs[1].strike
            assert {l.option_type for l in s.legs} == {"call", "put"}
        elif s.kind == "strangle":
            assert s.legs[0].strike != s.legs[1].strike
            assert {l.option_type for l in s.legs} == {"call", "put"}


def test_bias_filter_is_exclusive(chain):
    strikes, call_p, put_p, spot = chain
    for bias, expected in [
        (BULL_BIAS, {"bull_call_spread"}),
        (BEAR_BIAS, {"bear_put_spread"}),
        (SIDEWAY_BIAS, {"straddle", "strangle"}),
    ]:
        strategies = generate_strategies(strikes, call_p, put_p, spot, bias=bias)
        kinds = {s.kind for s in strategies}
        assert kinds == expected, f"bias={bias} gave {kinds}"


def test_no_bias_returns_all_kinds(chain):
    strikes, call_p, put_p, spot = chain
    strategies = generate_strategies(strikes, call_p, put_p, spot, bias=None)
    kinds = {s.kind for s in strategies}
    assert kinds == {"bull_call_spread", "bear_put_spread", "straddle", "strangle"}


# Capital filter -------------------------------------------------------

def test_capital_filter_rejects_over_max_debit(chain, tmp_path):
    strikes, call_p, put_p, spot = chain
    # Bump premiums so straddles blow past a tiny cap.
    big_put = put_p * 50.0
    strategies = generate_strategies(
        strikes, call_p, big_put, spot, bias=SIDEWAY_BIAS, max_debit=10.0
    )
    assert all(s.net_debit <= 10.0 for s in strategies)


# net_debit / payoff math ---------------------------------------------

def test_bull_spread_net_debit_is_long_minus_short(chain):
    strikes, call_p, put_p, spot = chain
    strategies = generate_strategies(strikes, call_p, put_p, spot, bias=BULL_BIAS)
    for s in strategies:
        long_leg = next(l for l in s.legs if l.long)
        short_leg = next(l for l in s.legs if not l.long)
        expected = long_leg.premium - short_leg.premium
        assert s.net_debit == pytest.approx(expected)


def test_payoff_at_expiry(chain):
    """A bull call spread's payoff is max(S-K_long,0) - max(S-K_short,0) - net_debit."""
    strikes, call_p, put_p, spot = chain
    strategies = generate_strategies(strikes, call_p, put_p, spot, bias=BULL_BIAS)
    s = strategies[0]
    K_long = min(l.strike for l in s.legs if l.long and l.option_type == "call")
    K_short = max(l.strike for l in s.legs if not l.long and l.option_type == "call")
    for S in [0.0, K_long, K_short, 1000.0]:
        payoff = sum(l.payoff(S) for l in s.legs)
        expected = max(S - K_long, 0) - max(S - K_short, 0)
        assert payoff == pytest.approx(expected - s.net_debit)
