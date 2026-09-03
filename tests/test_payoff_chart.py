"""Tests for PayoffChart widget."""
import pytest
from ui.widgets import Leg, Strategy, PayoffChart


class TestLeg:
    """Test individual leg payoff calculations."""

    def test_long_call_in_the_money(self):
        leg = Leg(option_type="call", strike=100, premium=5, direction="long")
        assert leg.payoff_at_expiry(110) == 5.0  # (110-100) - 5

    def test_long_call_out_of_the_money(self):
        leg = Leg(option_type="call", strike=100, premium=5, direction="long")
        assert leg.payoff_at_expiry(90) == -5.0  # 0 - 5

    def test_short_call(self):
        leg = Leg(option_type="call", strike=100, premium=5, direction="short")
        assert leg.payoff_at_expiry(110) == -5.0  # 5 - (110-100)
        assert leg.payoff_at_expiry(90) == 5.0  # 5 - 0

    def test_long_put_in_the_money(self):
        leg = Leg(option_type="put", strike=100, premium=5, direction="long")
        assert leg.payoff_at_expiry(90) == 5.0  # (100-90) - 5

    def test_long_put_out_of_the_money(self):
        leg = Leg(option_type="put", strike=100, premium=5, direction="long")
        assert leg.payoff_at_expiry(110) == -5.0  # 0 - 5


class TestStrategy:
    """Test multi-leg strategy calculations."""

    def test_long_call_strategy(self):
        strategy = Strategy(name="Long Call", legs=[
            Leg(option_type="call", strike=100, premium=5, direction="long")
        ])
        assert strategy.payoff_at_expiry(110) == 5.0
        assert strategy.payoff_at_expiry(90) == -5.0

    def test_bull_call_spread(self):
        strategy = Strategy(name="Bull Call Spread", legs=[
            Leg(option_type="call", strike=100, premium=5, direction="long"),
            Leg(option_type="call", strike=110, premium=2, direction="short")
        ])
        # At 110: long call = 10-5=5, short call = 2-(110-110)=2, total = 7
        assert strategy.payoff_at_expiry(110) == 7.0
        # At 90: long call = -5, short call = 2, total = -3
        assert strategy.payoff_at_expiry(90) == -3.0

    def test_straddle(self):
        strategy = Strategy(name="Long Straddle", legs=[
            Leg(option_type="call", strike=100, premium=5, direction="long"),
            Leg(option_type="put", strike=100, premium=5, direction="long")
        ])
        # At 100: both OTM, total = -10
        assert strategy.payoff_at_expiry(100) == -10.0
        # At 115: call = 10, put = -5, total = 5
        assert strategy.payoff_at_expiry(115) == 5.0
        # At 85: call = -5, put = 10, total = 5
        assert strategy.payoff_at_expiry(85) == 5.0

    def test_breakeven_single_leg(self):
        strategy = Strategy(name="Long Call", legs=[
            Leg(option_type="call", strike=100, premium=5, direction="long")
        ])
        breakevens = strategy.breakeven_prices(80, 120)
        assert len(breakevens) == 1
        assert abs(breakevens[0] - 105.0) < 0.1  # 100 + 5

    def test_breakeven_straddle(self):
        strategy = Strategy(name="Long Straddle", legs=[
            Leg(option_type="call", strike=100, premium=5, direction="long"),
            Leg(option_type="put", strike=100, premium=5, direction="long")
        ])
        breakevens = strategy.breakeven_prices(80, 120)
        assert len(breakevens) == 2
        assert abs(breakevens[0] - 90.0) < 0.1  # 100 - 10
        assert abs(breakevens[1] - 110.0) < 0.1  # 100 + 10

    def test_max_profit_loss(self):
        strategy = Strategy(name="Long Call", legs=[
            Leg(option_type="call", strike=100, premium=5, direction="long")
        ])
        assert strategy.max_loss(80, 120) == -5.0
        assert strategy.max_profit(80, 120) == 15.0  # At 120: 20-5=15


class TestPayoffChart:
    """Test ASCII rendering."""

    def test_render_no_strategy(self):
        chart = PayoffChart()
        result = chart.render_ascii()
        assert result == "No strategy selected"

    def test_render_with_strategy(self):
        strategy = Strategy(name="Long Call", legs=[
            Leg(option_type="call", strike=100, premium=5, direction="long")
        ])
        chart = PayoffChart(strategy=strategy, spot_min=80, spot_max=120, width=40, height=15)
        result = chart.render_ascii()

        # Should contain strategy name
        assert "Long Call" in result
        # Should contain max profit/loss info
        assert "Max Profit" in result
        assert "Max Loss" in result
        # Should contain breakeven info
        assert "Breakeven" in result
        # Should contain ASCII characters
        assert "●" in result or "─" in result

    def test_render_different_strategies(self):
        """Test rendering with different strategy types."""
        strategies = [
            Strategy(name="Long Call", legs=[
                Leg(option_type="call", strike=100, premium=5, direction="long")
            ]),
            Strategy(name="Long Put", legs=[
                Leg(option_type="put", strike=100, premium=5, direction="long")
            ]),
            Strategy(name="Straddle", legs=[
                Leg(option_type="call", strike=100, premium=5, direction="long"),
                Leg(option_type="put", strike=100, premium=5, direction="long")
            ])
        ]

        for strategy in strategies:
            chart = PayoffChart(strategy=strategy, spot_min=80, spot_max=120, width=40, height=15)
            result = chart.render_ascii()
            assert strategy.name in result
            assert "Max Profit" in result
            assert "Max Loss" in result

    def test_set_strategy(self):
        chart = PayoffChart(spot_min=80, spot_max=120, width=40, height=15)
        assert chart.render_ascii() == "No strategy selected"

        strategy = Strategy(name="Long Call", legs=[
            Leg(option_type="call", strike=100, premium=5, direction="long")
        ])
        chart.set_strategy(strategy)
        result = chart.render_ascii()
        assert "Long Call" in result
