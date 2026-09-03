"""Tests for ui.app — lifecycle, throttling, stale data."""

import time

import pytest

from ui.app import (
    DataUpdate,
    OptiQuantApp,
    AppState,
    STALE_THRESHOLD,
    RENDER_INTERVAL,
)


# -- Helpers ------------------------------------------------------------------

class FastApp(OptiQuantApp):
    """App with a mock engine that records calls and returns controlled data."""

    def __init__(self, **kw):
        super().__init__(**kw)
        self.fetch_count = 0

    async def _fetch_and_compute(self):
        self.fetch_count += 1
        return {"tick": self.fetch_count}


# -- Lifecycle ----------------------------------------------------------------

@pytest.mark.asyncio
async def test_app_mounts_and_composes():
    async with FastApp().run_test() as pilot:
        app = pilot.app
        assert app.query_one("#stale-banner") is not None
        assert app.query_one("#data-display") is not None


@pytest.mark.asyncio
async def test_data_update_message_updates_state():
    async with FastApp().run_test() as pilot:
        app = pilot.app
        now = time.monotonic()
        app.post_message(DataUpdate({"price": 42000}, now))
        await pilot.pause()
        assert app._state.data == {"price": 42000}
        assert app._state.last_update == now
        assert app._state.stale is False


# -- Throttling ---------------------------------------------------------------

@pytest.mark.asyncio
async def test_render_throttle_skips_rapid_calls():
    async with FastApp().run_test() as pilot:
        app = pilot.app
        app._state.data = {"x": 1}
        # First call renders
        app._last_render = 0.0
        app._throttled_render()
        first_render_time = app._last_render
        assert first_render_time > 0
        # Immediate second call should NOT advance _last_render
        app._throttled_render()
        assert app._last_render == first_render_time


# -- Stale data ---------------------------------------------------------------

@pytest.mark.asyncio
async def test_stale_detection_shows_banner():
    async with FastApp().run_test() as pilot:
        app = pilot.app
        # Simulate old data
        app._state.last_update = time.monotonic() - STALE_THRESHOLD - 1
        app._check_stale()
        assert app._state.stale is True
        banner = app.query_one("#stale-banner")
        assert "visible" in banner.classes


@pytest.mark.asyncio
async def test_fresh_data_hides_banner():
    async with FastApp().run_test() as pilot:
        app = pilot.app
        # First make it stale
        app._state.last_update = time.monotonic() - STALE_THRESHOLD - 1
        app._check_stale()
        assert app._state.stale is True
        # Then feed fresh data
        app.post_message(DataUpdate({"x": 1}, time.monotonic()))
        await pilot.pause()
        app._check_stale()
        assert app._state.stale is False
        banner = app.query_one("#stale-banner")
        assert "visible" not in banner.classes


# -- AppState defaults --------------------------------------------------------

def test_app_state_defaults():
    s = AppState()
    assert s.data == {}
    assert s.last_update == 0.0
    assert s.stale is False
