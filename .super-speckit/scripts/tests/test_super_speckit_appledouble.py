"""Regression: macOS AppleDouble ('._*') metadata files must not crash state tooling.

Reproduces the 2026-10-03 failure where '.super-speckit/state/features/._<id>.json'
(163-byte AppleDouble forks, binary, not UTF-8) made both
`super_speckit.py validate` and `status` die with:
    error: 'utf-8' codec can't decode byte 0xa3 in position 45
instead of reporting state.
"""
import importlib.util
import json
import subprocess
import sys
import tempfile
from pathlib import Path

SCRIPT = Path(__file__).resolve().parent.parent / "super_speckit.py"

APPLEDOUBLE_BLOB = bytes.fromhex("0005160700020000004d61632f000000a3")  # real ._ fork header shape, non-UTF-8


def _load_module():
    spec = importlib.util.spec_from_file_location("super_speckit", SCRIPT)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def _seed_repo(root: Path) -> None:
    features = root / ".super-speckit/state/features"
    features.mkdir(parents=True)
    (root / ".super-speckit/matrices").mkdir(parents=True)
    (root / ".super-speckit/matrices/t1.md").write_text("# matrix\n")
    # The real feature file.
    (features / "t1.json").write_text(json.dumps({
        "id": "t1", "state": "planned", "maker": "m", "checker": "c",
        "matrix": ".super-speckit/matrices/t1.md",
        "purpose": {"status": "not_started"}, "grill": {"status": "not_started"},
    }) + "\n")
    # The AppleDouble junk twin macOS copies leave beside it.
    (features / "._t1.json").write_bytes(APPLEDOUBLE_BLOB)
    (root / ".super-speckit/state/._features").write_bytes(APPLEDOUBLE_BLOB)
    mod = _load_module()
    mod.write_work_state_manifest(root)  # manifest must match render for validate to pass


def test_render_and_validate_skip_appledouble():
    with tempfile.TemporaryDirectory() as td:
        repo = Path(td)
        _seed_repo(repo)
        mod = _load_module()
        manifest = mod.render_work_state_manifest(repo)
        assert "t1" in manifest
        assert "._t1.json" not in manifest
        assert mod.validation_failures(repo) == []


def test_validate_cli_exit_zero_with_appledouble_junk():
    with tempfile.TemporaryDirectory() as td:
        repo = Path(td)
        _seed_repo(repo)
        result = subprocess.run(
            [sys.executable, str(SCRIPT), "validate", "--repo", str(repo)],
            capture_output=True, text=True,
        )
        assert result.returncode == 0, f"validate failed: {result.stdout}{result.stderr}"
        assert "state valid" in result.stdout
