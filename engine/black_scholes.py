"""Vectorized Black-Scholes pricing, Greeks, and log-normal PDF.

All functions accept NumPy arrays or scalars and return arrays of the same shape.
No Python loops over strategies.

Known limitation: BS assumes log-normal returns; crypto has fat tails.
"""

import numpy as np
from numpy.typing import ArrayLike
from scipy.stats import norm

Array = np.ndarray


def _d1d2(S: Array, K: Array, T: Array, r: float, sigma: Array) -> tuple[Array, Array]:
    """Compute d1, d2. Handles T→0 and sigma→0 edge cases."""
    S = np.asarray(S, dtype=np.float64)
    K = np.asarray(K, dtype=np.float64)
    T = np.asarray(T, dtype=np.float64)
    sigma = np.asarray(sigma, dtype=np.float64)

    sqrt_T = np.sqrt(T)
    vol_sqrt_T = sigma * sqrt_T

    # Avoid division by zero when sigma*sqrt(T) == 0
    with np.errstate(divide="ignore", invalid="ignore"):
        d1 = np.where(
            vol_sqrt_T > 0,
            (np.log(S / K) + (r + 0.5 * sigma**2) * T) / vol_sqrt_T,
            np.where(S > K, np.inf, np.where(S < K, -np.inf, 0.0)),
        )
        d2 = np.where(vol_sqrt_T > 0, d1 - vol_sqrt_T, d1)

    return d1, d2


def price_call(
    S: ArrayLike, K: ArrayLike, T: ArrayLike, r: float = 0.0, sigma: ArrayLike = 0.2
) -> Array:
    """Vectorized Black-Scholes European call price."""
    d1, d2 = _d1d2(S, K, T, r, sigma)
    S = np.asarray(S, dtype=np.float64)
    K = np.asarray(K, dtype=np.float64)
    T = np.asarray(T, dtype=np.float64)

    discount = np.exp(-r * T)
    return np.where(T > 0, S * norm.cdf(d1) - K * discount * norm.cdf(d2), np.maximum(S - K, 0.0))


def price_put(
    S: ArrayLike, K: ArrayLike, T: ArrayLike, r: float = 0.0, sigma: ArrayLike = 0.2
) -> Array:
    """Vectorized Black-Scholes European put price."""
    d1, d2 = _d1d2(S, K, T, r, sigma)
    S = np.asarray(S, dtype=np.float64)
    K = np.asarray(K, dtype=np.float64)
    T = np.asarray(T, dtype=np.float64)

    discount = np.exp(-r * T)
    return np.where(T > 0, K * discount * norm.cdf(-d2) - S * norm.cdf(-d1), np.maximum(K - S, 0.0))


def calculate_greeks(
    S: ArrayLike, K: ArrayLike, T: ArrayLike, r: float = 0.0, sigma: ArrayLike = 0.2
) -> dict[str, Array]:
    """Vectorized Greeks: delta_call, delta_put, gamma, theta_call, theta_put, vega.

    Returns dict with keys: delta_call, delta_put, gamma, theta_call, theta_put, vega.
    Theta is per year (divide by 365 for per-day).
    """
    d1, d2 = _d1d2(S, K, T, r, sigma)
    S = np.asarray(S, dtype=np.float64)
    K = np.asarray(K, dtype=np.float64)
    T = np.asarray(T, dtype=np.float64)
    sigma = np.asarray(sigma, dtype=np.float64)

    sqrt_T = np.sqrt(T)
    vol_sqrt_T = sigma * sqrt_T
    discount = np.exp(-r * T)
    nd1 = norm.pdf(d1)  # standard normal PDF at d1

    delta_call = np.where(T > 0, norm.cdf(d1), np.where(S > K, 1.0, np.where(S == K, 0.5, 0.0)))
    delta_put = delta_call - 1.0

    # Gamma: zero when T=0 or sigma=0 (degenerate)
    with np.errstate(divide="ignore", invalid="ignore"):
        gamma = np.where(
            vol_sqrt_T > 0,
            nd1 / (S * vol_sqrt_T),
            0.0,
        )

    # Vega: same for call and put
    vega = np.where(T > 0, S * nd1 * sqrt_T, 0.0)

    # Theta (per year)
    with np.errstate(divide="ignore", invalid="ignore"):
        theta_call = np.where(
            T > 0,
            -(S * nd1 * sigma) / (2.0 * sqrt_T) - r * K * discount * norm.cdf(d2),
            0.0,
        )
        theta_put = np.where(
            T > 0,
            -(S * nd1 * sigma) / (2.0 * sqrt_T) + r * K * discount * norm.cdf(-d2),
            0.0,
        )

    return {
        "delta_call": delta_call,
        "delta_put": delta_put,
        "gamma": gamma,
        "theta_call": theta_call,
        "theta_put": theta_put,
        "vega": vega,
    }


def lognormal_pdf(
    S: ArrayLike, K: ArrayLike, T: ArrayLike, r: float = 0.0, sigma: ArrayLike = 0.2
) -> Array:
    """Log-normal probability density of terminal stock price S_T = K.

    f(K) = φ(d2) / (K * σ * √T)
    where φ is the standard normal PDF and d2 is from BS.
    """
    d1, d2 = _d1d2(S, K, T, r, sigma)
    K = np.asarray(K, dtype=np.float64)
    T = np.asarray(T, dtype=np.float64)
    sigma = np.asarray(sigma, dtype=np.float64)

    vol_sqrt_T = sigma * np.sqrt(T)
    with np.errstate(divide="ignore", invalid="ignore"):
        return np.where(vol_sqrt_T > 0, norm.pdf(d2) / (K * vol_sqrt_T), 0.0)
