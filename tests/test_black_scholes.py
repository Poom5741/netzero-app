"""Tests for engine.black_scholes — verified against published BS tables and edge cases."""

import numpy as np
import pytest

from engine.black_scholes import (
    calculate_greeks,
    lognormal_pdf,
    price_call,
    price_put,
)


# --- Published table verification ---
# Reference: Hull, "Options, Futures, and Other Derivatives" and standard BS calculators.
# S=100, K=100, r=0.05, σ=0.20, T=1.0 → Call≈10.4506, Put≈5.5735
class TestPublishedValues:
    def test_atm_call(self):
        c = price_call(100, 100, 1.0, 0.05, 0.20)
        assert abs(c - 10.4506) < 0.01

    def test_atm_put(self):
        p = price_put(100, 100, 1.0, 0.05, 0.20)
        assert abs(p - 5.5735) < 0.01

    def test_put_call_parity(self):
        """C - P = S - K*exp(-rT)"""
        S, K, T, r, sigma = 100.0, 100.0, 1.0, 0.05, 0.20
        c = price_call(S, K, T, r, sigma)
        p = price_put(S, K, T, r, sigma)
        parity = c - p - (S - K * np.exp(-r * T))
        assert abs(parity) < 1e-10

    def test_itm_call(self):
        # S=110, K=100, r=0.05, σ=0.20, T=1 → Call ≈ 17.663
        c = price_call(110, 100, 1.0, 0.05, 0.20)
        assert abs(c - 17.663) < 0.01

    def test_otm_call(self):
        # S=90, K=100, r=0.05, σ=0.20, T=1 → Call ≈ 5.091
        c = price_call(90, 100, 1.0, 0.05, 0.20)
        assert abs(c - 5.091) < 0.01

    def test_itm_put(self):
        # S=90, K=100, r=0.05, σ=0.20, T=1 → Put ≈ 10.214
        p = price_put(90, 100, 1.0, 0.05, 0.20)
        assert abs(p - 10.214) < 0.01

    def test_otm_put(self):
        # S=110, K=100, r=0.05, σ=0.20, T=1 → Put ≈ 2.70
        p = price_put(110, 100, 1.0, 0.05, 0.20)
        assert abs(p - 2.70) < 0.1


# --- Vectorization ---
class TestVectorized:
    def test_array_inputs(self):
        S = np.array([90, 100, 110])
        K = np.array([100, 100, 100])
        T = np.array([1.0, 1.0, 1.0])
        c = price_call(S, K, T, 0.05, 0.20)
        assert c.shape == (3,)
        assert c[0] < c[1] < c[2]  # OTM < ATM < ITM

    def test_greeks_array(self):
        S = np.array([80, 100, 120])
        K = 100.0
        g = calculate_greeks(S, K, 1.0, 0.05, 0.20)
        assert g["delta_call"].shape == (3,)
        assert g["delta_call"][0] < g["delta_call"][1] < g["delta_call"][2]
        assert np.all(g["gamma"] > 0)
        assert np.all(g["vega"] > 0)


# --- Edge cases ---
class TestEdgeCases:
    def test_T_zero_itm_call(self):
        """At expiry, ITM call = intrinsic value."""
        c = price_call(110, 100, 0.0, 0.05, 0.20)
        assert abs(c - 10.0) < 1e-10

    def test_T_zero_otm_call(self):
        c = price_call(90, 100, 0.0, 0.05, 0.20)
        assert abs(c - 0.0) < 1e-10

    def test_T_zero_itm_put(self):
        p = price_put(90, 100, 0.0, 0.05, 0.20)
        assert abs(p - 10.0) < 1e-10

    def test_T_zero_otm_put(self):
        p = price_put(110, 100, 0.0, 0.05, 0.20)
        assert abs(p - 0.0) < 1e-10

    def test_sigma_zero_call(self):
        """Zero vol: call = max(S - K*exp(-rT), 0)"""
        c = price_call(110, 100, 1.0, 0.05, 0.0)
        intrinsic = 110 - 100 * np.exp(-0.05)
        assert abs(c - intrinsic) < 1e-10

    def test_sigma_zero_put(self):
        p = price_put(90, 100, 1.0, 0.05, 0.0)
        intrinsic = 100 * np.exp(-0.05) - 90
        assert abs(p - intrinsic) < 1e-10

    def test_deep_itm_call(self):
        c = price_call(200, 50, 1.0, 0.05, 0.20)
        assert c > 140  # close to intrinsic ~150

    def test_deep_otm_call(self):
        c = price_call(50, 200, 1.0, 0.05, 0.20)
        assert c < 0.01

    def test_deep_itm_put(self):
        p = price_put(50, 200, 1.0, 0.05, 0.20)
        assert p > 140

    def test_deep_otm_put(self):
        p = price_put(200, 50, 1.0, 0.05, 0.20)
        assert p < 0.01

    def test_greeks_T_zero(self):
        g = calculate_greeks(100, 100, 0.0, 0.05, 0.20)
        assert g["gamma"][()] == 0.0
        assert g["vega"][()] == 0.0


# --- Greeks sanity checks ---
class TestGreeks:
    def test_delta_bounds(self):
        g = calculate_greeks(100, 100, 1.0, 0.05, 0.20)
        assert 0 < g["delta_call"] < 1
        assert -1 < g["delta_put"] < 0

    def test_gamma_positive(self):
        g = calculate_greeks(100, 100, 1.0, 0.05, 0.20)
        assert g["gamma"] > 0

    def test_vega_positive(self):
        g = calculate_greeks(100, 100, 1.0, 0.05, 0.20)
        assert g["vega"] > 0

    def test_theta_negative_for_call(self):
        g = calculate_greeks(100, 100, 1.0, 0.05, 0.20)
        assert g["theta_call"] < 0  # time decay

    def test_delta_call_approaches_1_deep_itm(self):
        g = calculate_greeks(200, 100, 1.0, 0.05, 0.20)
        assert g["delta_call"] > 0.99

    def test_delta_call_approaches_0_deep_otm(self):
        g = calculate_greeks(50, 100, 1.0, 0.05, 0.20)
        assert g["delta_call"] < 0.01


# --- Log-normal PDF ---
class TestLognormalPDF:
    def test_integrates_to_one(self):
        """PDF should integrate to ~1 over a wide range."""
        S, r, sigma, T = 100.0, 0.05, 0.20, 1.0
        K = np.linspace(1, 500, 10000)
        pdf = lognormal_pdf(S, K, T, r, sigma)
        integral = np.trapezoid(pdf, K)
        assert abs(integral - 1.0) < 0.01

    def test_pdf_positive(self):
        pdf = lognormal_pdf(100, 100, 1.0, 0.05, 0.20)
        assert pdf > 0

    def test_pdf_zero_vol(self):
        pdf = lognormal_pdf(100, 100, 1.0, 0.05, 0.0)
        assert pdf == 0.0