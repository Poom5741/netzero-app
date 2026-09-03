from datetime import date

from ui.control_panel import ControlPanel, FilterState


def test_filter_state_defaults():
    s = FilterState()
    assert s.bias is None
    assert s.capital_limit == 0.0
    assert s.expiry_from is None
    assert s.expiry_to is None


def test_filter_by_bias():
    panel = ControlPanel()
    panel._state = FilterState(bias="bullish")
    strategies = [
        {"bias": "bullish", "capital": 0, "expiry": date(2025, 1, 1)},
        {"bias": "bearish", "capital": 0, "expiry": date(2025, 1, 1)},
    ]
    result = panel.filter_strategies(strategies)
    assert len(result) == 1
    assert result[0]["bias"] == "bullish"


def test_filter_by_capital():
    panel = ControlPanel()
    panel._state = FilterState(bias=None, capital_limit=0.0)
    strategies = [
        {"bias": "bullish", "capital": 0, "expiry": date(2025, 1, 1)},
        {"bias": "bullish", "capital": 100, "expiry": date(2025, 1, 1)},
    ]
    result = panel.filter_strategies(strategies)
    assert len(result) == 1
    assert result[0]["capital"] == 0


def test_filter_by_expiry_range():
    panel = ControlPanel()
    panel._state = FilterState(
        expiry_from=date(2025, 3, 1),
        expiry_to=date(2025, 6, 1),
    )
    strategies = [
        {"expiry": date(2024, 1, 1)},
        {"expiry": date(2025, 4, 1)},
        {"expiry": date(2025, 8, 1)},
    ]
    result = panel.filter_strategies(strategies)
    assert len(result) == 1
    assert result[0]["expiry"] == date(2025, 4, 1)


def test_parse_date_invalid():
    panel = ControlPanel()
    assert panel._parse_date("") is None
    assert panel._parse_date("garbage") is None
    assert panel._parse_date("2025-01-01") == date(2025, 1, 1)


def test_filter_all_constraints():
    panel = ControlPanel()
    panel._state = FilterState(
        bias="bearish", capital_limit=0,
        expiry_from=date(2025, 1, 1), expiry_to=date(2025, 12, 31),
    )
    strategies = [
        {"bias": "bearish", "capital": 0, "expiry": date(2025, 6, 1)},
        {"bias": "bullish", "capital": 0, "expiry": date(2025, 6, 1)},  # wrong bias
        {"bias": "bearish", "capital": 5, "expiry": date(2025, 6, 1)},  # too much capital
        {"bias": "bearish", "capital": 0, "expiry": date(2026, 6, 1)},  # out of range
    ]
    result = panel.filter_strategies(strategies)
    assert len(result) == 1
