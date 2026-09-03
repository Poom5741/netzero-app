"""OptiQuant-EV — Textual application skeleton with live update loop."""

from __future__ import annotations

import asyncio
import time
from dataclasses import dataclass, field
from typing import Any

from textual.app import App, ComposeResult
from textual.message import Message
from textual.widgets import Label, Static

# -- Timing constants ---------------------------------------------------------

ENGINE_INTERVAL = 1.0      # 1 Hz engine recalculation
RENDER_INTERVAL = 0.5      # 2 Hz UI rendering throttle
STALE_THRESHOLD = 30.0     # seconds before data is considered stale


# -- Messages -----------------------------------------------------------------

class DataUpdate(Message):
    """Posted from background worker → main thread with fresh engine data."""

    def __init__(self, data: dict[str, Any], timestamp: float) -> None:
        super().__init__()
        self.data = data
        self.timestamp = timestamp


# -- Data container -----------------------------------------------------------

@dataclass
class AppState:
    """Holds the latest engine snapshot and staleness metadata."""

    data: dict[str, Any] = field(default_factory=dict)
    last_update: float = 0.0
    stale: bool = False


# -- Application --------------------------------------------------------------

CSS = """
#stale-banner {
    background: $error;
    color: $text;
    text-style: bold;
    text-align: center;
    display: none;
    padding: 0 1;
}
#stale-banner.visible {
    display: block;
}
#data-display {
    padding: 1;
}
"""


class OptiQuantApp(App):
    """Main Textual application for OptiQuant-EV."""

    TITLE = "OptiQuant-EV"
    CSS = CSS
    ENGINE_INTERVAL = ENGINE_INTERVAL
    RENDER_INTERVAL = RENDER_INTERVAL
    STALE_THRESHOLD = STALE_THRESHOLD

    def __init__(self, **kwargs: Any) -> None:
        super().__init__(**kwargs)
        self._state = AppState()
        self._last_render: float = 0.0

    # -- Layout ---------------------------------------------------------------

    def compose(self) -> ComposeResult:
        yield Label("⚠ STALE DATA — no update for >30s", id="stale-banner")
        yield Static("Waiting for data…", id="data-display")

    # -- Lifecycle ------------------------------------------------------------

    async def on_mount(self) -> None:
        self._state.last_update = time.monotonic()
        self.run_worker(self._engine_loop, name="engine", exclusive=False)
        self.set_interval(self.RENDER_INTERVAL, self._throttled_render)
        self.set_interval(self.STALE_THRESHOLD / 2, self._check_stale)

    # -- Background worker (1 Hz) ---------------------------------------------

    async def _engine_loop(self) -> None:
        """Fetch / recalculate data at 1 Hz, post results to UI thread."""
        while not self.is_mounted:
            await asyncio.sleep(0.05)
        while True:
            try:
                data = await self._fetch_and_compute()
                self.post_message(DataUpdate(data, time.monotonic()))
            except Exception:
                pass  # ponytail: log to status bar, add when error handling is needed
            await asyncio.sleep(self.ENGINE_INTERVAL)

    async def _fetch_and_compute(self) -> dict[str, Any]:
        """Override in subclass or replace with real engine call."""
        return {"tick": time.monotonic()}

    # -- Message handler ------------------------------------------------------

    def on_data_update(self, msg: DataUpdate) -> None:
        self._state.data = msg.data
        self._state.last_update = msg.timestamp
        self._state.stale = False

    # -- 2 Hz throttled render ------------------------------------------------

    def _throttled_render(self) -> None:
        now = time.monotonic()
        if now - self._last_render < self.RENDER_INTERVAL:
            return
        self._last_render = now
        self._render_display()

    def _render_display(self) -> None:
        """Update the data display widget with current state."""
        display = self.query_one("#data-display", Static)
        if not self._state.data:
            return
        lines = [f"{k}: {v}" for k, v in self._state.data.items()]
        display.update("\n".join(lines))

    # -- Stale data detection -------------------------------------------------

    def _check_stale(self) -> None:
        age = time.monotonic() - self._state.last_update
        self._state.stale = age >= self.STALE_THRESHOLD

        banner = self.query_one("#stale-banner", Label)
        banner.set_class(self._state.stale, "visible")


# -- Entry point --------------------------------------------------------------

def run() -> None:
    OptiQuantApp().run()


if __name__ == "__main__":
    run()
