"""ControlPanel widget — bias filter, capital limit, expiry range."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date
from typing import Literal

from textual.app import ComposeResult
from textual.containers import Horizontal, Vertical
from textual.message import Message
from textual.widget import Widget
from textual.widgets import Input, Label, RadioSet, RadioButton, Static

Bias = Literal["bullish", "bearish", "sideways"]


@dataclass(frozen=True)
class FilterState:
    bias: Bias | None = None
    capital_limit: float = 0.0
    expiry_from: date | None = None
    expiry_to: date | None = None


class ControlPanel(Widget):
    """Interactive filter controls for strategy scanning."""

    DEFAULT_CSS = """
    ControlPanel {
        height: auto;
        max-height: 12;
        border: solid $accent;
        padding: 0 1;
    }
    ControlPanel Horizontal { height: auto; }
    ControlPanel .section { width: 1fr; margin: 0 1; }
    ControlPanel Label { color: $text-muted; }
    """

    class Changed(Message):
        """Posted when any filter value changes."""
        def __init__(self, state: FilterState) -> None:
            self.state = state
            super().__init__()

    def __init__(self, *, capital_max: float = 0.0, **kwargs) -> None:
        super().__init__(**kwargs)
        self._capital_max = capital_max
        self._state = FilterState(capital_limit=capital_max)

    def compose(self) -> ComposeResult:
        with Horizontal():
            with Vertical(classes="section"):
                yield Label("Bias")
                with RadioSet(id="bias"):
                    yield RadioButton("Bullish", id="bias-bullish")
                    yield RadioButton("Bearish", id="bias-bearish")
                    yield RadioButton("Sideways", id="bias-sideways")
            with Vertical(classes="section"):
                yield Label(f"Capital limit (max {self._capital_max:.0f})")
                yield Input(
                    value=str(self._capital_max),
                    placeholder="0",
                    id="capital",
                    type="number",
                )
            with Vertical(classes="section"):
                yield Label("Expiry range")
                with Horizontal():
                    yield Input(placeholder="From YYYY-MM-DD", id="expiry-from")
                    yield Input(placeholder="To YYYY-MM-DD", id="expiry-to")

    def _parse_date(self, raw: str) -> date | None:
        raw = raw.strip()
        if not raw:
            return None
        try:
            return date.fromisoformat(raw)
        except ValueError:
            return None

    def _read_state(self) -> FilterState:
        bias: Bias | None = None
        radio = self.query_one("#bias", RadioSet)
        if radio.pressed_button is not None:
            bid = radio.pressed_button.id or ""
            bias = bid.rsplit("-", 1)[-1]  # type: ignore[assignment]

        capital_input = self.query_one("#capital", Input)
        try:
            capital = min(float(capital_input.value or 0), self._capital_max)
        except ValueError:
            capital = self._capital_max

        return FilterState(
            bias=bias,
            capital_limit=max(0.0, capital),
            expiry_from=self._parse_date(self.query_one("#expiry-from", Input).value),
            expiry_to=self._parse_date(self.query_one("#expiry-to", Input).value),
        )

    def _emit(self) -> None:
        self._state = self._read_state()
        self.post_message(self.Changed(self._state))

    def on_radio_set_changed(self) -> None:
        self._emit()

    def on_input_changed(self) -> None:
        self._emit()

    @property
    def state(self) -> FilterState:
        return self._state

    def filter_strategies(self, strategies: list[dict]) -> list[dict]:
        """Filter a list of strategy dicts by current state. ponytail: in-memory filter; move to DB query when >1k strategies."""
        s = self._state
        out = strategies
        if s.bias is not None:
            out = [st for st in out if st.get("bias") == s.bias]
        out = [st for st in out if st.get("capital", 0) <= s.capital_limit]
        if s.expiry_from:
            out = [st for st in out if (st.get("expiry") or date.min) >= s.expiry_from]
        if s.expiry_to:
            out = [st for st in out if (st.get("expiry") or date.max) <= s.expiry_to]
        return out
