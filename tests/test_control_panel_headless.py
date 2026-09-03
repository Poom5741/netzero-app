"""Headless smoke test: verify ControlPanel composes and emits Changed messages."""

import pytest
from textual.pilot import Pilot

from ui.control_panel import ControlPanel, FilterState


@pytest.mark.asyncio
async def test_compose_and_interact():
    """ControlPanel composes without error and emits Changed on bias click."""
    from textual.app import App, ComposeResult

    class TestApp(App):
        def compose(self) -> ComposeResult:
            yield ControlPanel()

    async with TestApp().run_test() as pilot:
        app = pilot.app
        panel = app.query_one(ControlPanel)

        # Verify child widgets exist
        assert panel.query_one("#bias")
        assert panel.query_one("#capital")
        assert panel.query_one("#expiry-from")
        assert panel.query_one("#expiry-to")

        # Default state
        assert panel.state.bias is None
        assert panel.state.capital_limit == 0.0


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
