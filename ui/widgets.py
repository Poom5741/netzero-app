"""UI widgets for OptiQuant-EV terminal dashboard."""
from dataclasses import dataclass
from typing import Literal

from textual.widgets import Static


@dataclass
class Leg:
    """Single option leg in a strategy."""
    option_type: Literal["call", "put"]
    strike: float
    premium: float
    direction: Literal["long", "short"] = "long"

    def payoff_at_expiry(self, spot: float) -> float:
        """Calculate P&L per unit at expiry for given spot price."""
        if self.option_type == "call":
            intrinsic = max(0, spot - self.strike)
        else:
            intrinsic = max(0, self.strike - spot)

        if self.direction == "long":
            return intrinsic - self.premium
        return self.premium - intrinsic


@dataclass
class Strategy:
    """Multi-leg options strategy."""
    name: str
    legs: list[Leg]

    def payoff_at_expiry(self, spot: float) -> float:
        """Total P&L at expiry for given spot price."""
        return sum(leg.payoff_at_expiry(spot) for leg in self.legs)

    def payoff_range(self, spot_min: float, spot_max: float, steps: int = 100) -> list[tuple[float, float]]:
        """Calculate P&L across price range. Returns list of (spot, pnl) tuples."""
        step_size = (spot_max - spot_min) / max(1, steps - 1)
        return [(spot_min + i * step_size, self.payoff_at_expiry(spot_min + i * step_size))
                for i in range(steps)]

    def breakeven_prices(self, spot_min: float, spot_max: float, steps: int = 1000) -> list[float]:
        """Find breakeven prices where P&L crosses zero."""
        points = self.payoff_range(spot_min, spot_max, steps)
        breakevens = []
        for i in range(len(points) - 1):
            spot1, pnl1 = points[i]
            spot2, pnl2 = points[i + 1]
            # Zero crossing
            if (pnl1 <= 0 < pnl2) or (pnl1 >= 0 > pnl2):
                # Linear interpolation
                if pnl2 != pnl1:
                    breakeven = spot1 - pnl1 * (spot2 - spot1) / (pnl2 - pnl1)
                    breakevens.append(breakeven)
        return breakevens

    def max_profit(self, spot_min: float, spot_max: float, steps: int = 100) -> float:
        """Maximum profit in price range."""
        return max(pnl for _, pnl in self.payoff_range(spot_min, spot_max, steps))

    def max_loss(self, spot_min: float, spot_max: float, steps: int = 100) -> float:
        """Maximum loss in price range (negative value)."""
        return min(pnl for _, pnl in self.payoff_range(spot_min, spot_max, steps))


class PayoffChart(Static):
    """ASCII visualization of strategy payoff at expiry."""

    DEFAULT_CSS = """
    PayoffChart {
        width: 100%;
        height: auto;
        padding: 1;
    }
    """

    def __init__(self, strategy: Strategy | None = None,
                 spot_min: float = 0.0, spot_max: float = 200.0,
                 width: int = 60, height: int = 20, **kwargs):
        super().__init__(**kwargs)
        self.strategy = strategy
        self.spot_min = spot_min
        self.spot_max = spot_max
        self.chart_width = width
        self.chart_height = height

    def set_strategy(self, strategy: Strategy, spot_min: float | None = None, spot_max: float | None = None) -> None:
        """Update strategy and optional price range."""
        self.strategy = strategy
        if spot_min is not None:
            self.spot_min = spot_min
        if spot_max is not None:
            self.spot_max = spot_max
        self.refresh()

    def render_ascii(self) -> str:
        """Render ASCII payoff diagram. Returns multi-line string."""
        if not self.strategy:
            return "No strategy selected"

        points = self.strategy.payoff_range(self.spot_min, self.spot_max, self.chart_width)
        if not points:
            return "No data"

        spots = [s for s, _ in points]
        pnls = [p for _, p in points]

        pnl_min = min(pnls)
        pnl_max = max(pnls)

        # Add padding to P&L range
        pnl_range = pnl_max - pnl_min
        if pnl_range == 0:
            pnl_range = 1
        pnl_min_padded = pnl_min - pnl_range * 0.1
        pnl_max_padded = pnl_max + pnl_range * 0.1

        # Build ASCII grid
        lines = []

        # Header with max profit/loss
        breakevens = self.strategy.breakeven_prices(self.spot_min, self.spot_max)
        max_profit = self.strategy.max_profit(self.spot_min, self.spot_max)
        max_loss = self.strategy.max_loss(self.spot_min, self.spot_max)

        lines.append(f"Strategy: {self.strategy.name}")
        lines.append(f"Max Profit: {max_profit:+.2f}  Max Loss: {max_loss:+.2f}")
        if breakevens:
            be_str = ", ".join(f"{b:.2f}" for b in breakevens[:3])
            lines.append(f"Breakeven: {be_str}")
        lines.append("")

        # ASCII chart
        for row in range(self.chart_height):
            # Map row to P&L value (top row = max, bottom row = min)
            row_pnl = pnl_max_padded - (row / (self.chart_height - 1)) * (pnl_max_padded - pnl_min_padded)

            line = ""
            for col in range(self.chart_width):
                # Map column to spot price
                spot_idx = int(col / (self.chart_width - 1) * (len(points) - 1))
                point_pnl = pnls[spot_idx]

                # Check if this cell contains the P&L line
                if abs(point_pnl - row_pnl) <= (pnl_max_padded - pnl_min_padded) / self.chart_height / 2:
                    line += "●"
                elif abs(row_pnl) <= (pnl_max_padded - pnl_min_padded) / self.chart_height / 2:
                    line += "─"  # Zero line
                else:
                    line += " "

            # Add P&L label on right
            if row == 0:
                line += f" {pnl_max:+.1f}"
            elif row == self.chart_height - 1:
                line += f" {pnl_min:+.1f}"
            elif row == self.chart_height // 2:
                line += " 0.0"

            lines.append(line)

        # X-axis labels
        lines.append("─" * self.chart_width + f" {self.spot_min:.0f} → {self.spot_max:.0f}")

        return "\n".join(lines)

    def render(self) -> str:
        """Textual render method."""
        return self.render_ascii()
