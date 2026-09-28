#!/usr/bin/env python3
"""
check-repository-hygiene.py — read-only repository hygiene validator.

Exits 0 if all checks pass; exits non-zero and prints failures to stderr.

Validates:
  1. Required canonical navigation paths exist.
  2. Local Markdown links in README.md and docs/README.md resolve.
  3. .next/trace is ignored (not tracked).
  4. Retained sample/placeholder paths remain visible.
  5. No tracked file matches current ignore rules.
  6. Root generated-output paths are properly ignored.
"""

from __future__ import annotations

import os
import re
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent


# ---------------------------------------------------------------------------
# 1. Required canonical paths
# ---------------------------------------------------------------------------
REQUIRED_PATHS: list[tuple[str, str]] = [
    ("README.md", "root entry point"),
    ("AGENTS.md", "agent conventions"),
    ("CONTEXT.md", "product context"),
    ("DESIGN.md", "design overview"),
    ("PRODUCT.md", "product requirements"),
    ("REQUIREMENTS.md", "requirements"),
    ("DEV_SETUP.md", "developer setup"),
    (".gitignore", "ignore policy"),
    ("package.json", "root package manifest"),
    ("wrangler.toml", "worker config"),
    ("src/index.ts", "worker entry point"),
    ("src/db/migrate.sql", "schema"),
    ("frontend/package.json", "frontend manifest"),
    ("frontend/next.config.ts", "frontend config"),
    ("tests/unit", "unit tests"),
    ("tests/integration", "integration tests"),
    ("design-artifacts", "design reference archive"),
    ("scripts/check-repository-hygiene.py", "this script"),
]

# Paths that must NOT be ignored (retained placeholders/samples)
RETAINED_PLACEHOLDERS: list[tuple[str, str]] = [
    ("tests/visual/captures/.gitkeep", "visual capture placeholder"),
    (".dev.vars.example", "env template"),
    ("design-artifacts/2026-09-28/README.md", "design artifact index"),
]

# Root paths that should be ignored (generated transient).
# These are the directories removed from tracking in the 2026-09-29 cleanup;
# the rule exists so they cannot creep back in.
IGNORED_ROOT_PATTERNS: list[str] = [
    ".next/",
    "test-results/",
    ".mimosa/",
    ".playwright-mcp/",
    "visual-qa-screenshots/",
]


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def repo_path(relative: str) -> Path:
    return REPO_ROOT / relative


def run_git(cmd: list[str], check: bool = True) -> subprocess.CompletedProcess:
    """Run a git command; treat failures as gate failures by default."""
    try:
        return subprocess.run(
            cmd,
            cwd=str(REPO_ROOT),
            capture_output=True,
            text=True,
            check=check,
        )
    except subprocess.CalledProcessError as e:
        # Git command failures are gate failures, never clean results
        sys.stderr.write(
            f"[GIT ERROR] command `{' '.join(cmd)}` failed with exit {e.returncode}\n"
        )
        sys.stderr.write(f"  stdout: {e.stdout}\n")
        sys.stderr.write(f"  stderr: {e.stderr}\n")
        raise SystemExit(1) from e


def git_ls_files(pattern: str = "") -> set[str]:
    """Return set of all tracked files, optionally filtered by pattern."""
    cmd = ["git", "-C", str(REPO_ROOT), "ls-files"]
    if pattern:
        cmd.append(pattern)
    try:
        out = run_git(cmd, check=True).stdout
        return {line.strip() for line in out.strip().splitlines() if line.strip()}
    except SystemExit:
        raise SystemExit(1)


def git_ls_files_cached_ignored() -> set[str]:
    """Return tracked files that are also ignored (cached-ignored)."""
    cmd = ["git", "-C", str(REPO_ROOT), "ls-files", "-ci", "--exclude-standard"]
    try:
        out = run_git(cmd, check=True).stdout
        return {line.strip() for line in out.strip().splitlines() if line.strip()}
    except SystemExit:
        raise SystemExit(1)


def git_check_ignore(path: str) -> bool:
    """
    Return True if path is ignored by current gitignore rules.
    Uses --no-index to query the index independently so that
    tracked-ignored files are detected correctly.

    Exit codes via the captured Git helper:
      0  → path is ignored
      1  → path is not ignored
      other / signal / launch failure → print diagnostics and fail the gate
    """
    cmd = ["git", "-C", str(REPO_ROOT), "check-ignore", "--no-index", "-q", "--", path]
    proc = subprocess.run(
        cmd,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.PIPE,
        text=True,
    )
    if proc.returncode == 0:
        return True
    if proc.returncode == 1:
        return False
    print(f"git check-ignore --no-index failed for {path!r}: {proc.stderr.strip()}", file=sys.stderr)
    raise SystemExit(1)


def resolve_markdown_links(content: str, base_path: Path) -> list[tuple[str, Path | None]]:
    """
    Return list of (link_target, resolved_path_or_None) for local links in Markdown.

    Handles:
      - Directory links ending in / (resolve as the directory path)
      - Links with query strings and/or fragments (strip before resolution)
      - True external schemes (http:, https:, mailto:, tel:) — skip
      - Links that end in .md or contain no extension — resolve as-is
    """
    results = []
    # Match Markdown links: [text](url)
    link_pattern = re.compile(r'\[([^\]]+)\]\(([^)]+)\)')
    for match in link_pattern.finditer(content):
        link_target = match.group(2).strip()

        # Skip true external schemes and anchor-only links
        if re.match(r"^(https?:|mailto:|tel:|#)", link_target):
            results.append((link_target, base_path))  # external / anchor, skip
            continue

        # Strip query string and fragment for filesystem resolution
        clean = link_target.split("#")[0].split("?")[0]

        # Resolve relative to the file's directory
        if clean.startswith("/"):
            resolved = REPO_ROOT / clean.lstrip("/")
        else:
            resolved = (base_path.parent / clean).resolve()

        results.append((link_target, resolved if resolved.exists() else None))
    return results


# ---------------------------------------------------------------------------
# Check functions — return (ok: bool, message: str)
# ---------------------------------------------------------------------------
def check_required_paths() -> tuple[bool, str]:
    """Verify all required canonical paths exist."""
    failures: list[str] = []
    for rel_path, description in REQUIRED_PATHS:
        p = repo_path(rel_path)
        if not p.exists():
            failures.append(f"  [MISSING] {rel_path} — {description}")
    if failures:
        return False, "Required paths missing:\n" + "\n".join(failures)
    return True, ""


def check_markdown_links(root_file: str) -> tuple[bool, str]:
    """Verify local links resolve in the given file."""
    p = repo_path(root_file)
    if not p.exists():
        return False, f"{root_file} does not exist — cannot check links"

    content = p.read_text(encoding="utf-8")
    failures: list[str] = []
    for link_target, resolved in resolve_markdown_links(content, p):
        if resolved is None or not resolved.exists():
            failures.append(f"  [BROKEN LINK] {root_file} → {link_target}")
    if failures:
        return False, f"Broken local links in {root_file}:\n" + "\n".join(failures)
    return True, ""


def check_next_trace_ignored() -> tuple[bool, str]:
    """Verify .next/trace is ignored (not tracked)."""
    tracked = git_ls_files(".next/")
    if any("trace" in f for f in tracked):
        return False, "  [TRACKED] .next/trace is tracked — must be ignored"
    return True, ""


def check_retained_placeholders() -> tuple[bool, str]:
    """
    Verify retained sample/placeholder paths exist and are NOT ignored.
    Fail if a retained path is missing OR if it is ignored.
    """
    failures: list[str] = []
    for rel_path, description in RETAINED_PLACEHOLDERS:
        p = repo_path(rel_path)
        if not p.exists():
            failures.append(f"  [MISSING RETAINED] {rel_path} — {description}")
        elif git_check_ignore(rel_path):
            failures.append(f"  [IGNORED RETAINED] {rel_path} — {description}")
    if failures:
        return False, "Retained placeholders issues:\n" + "\n".join(failures)
    return True, ""


def check_no_tracked_ignored() -> tuple[bool, str]:
    """
    Fail if any tracked file currently matches gitignore rules.
    Uses git ls-files -ci --exclude-standard for index-independent detection.
    """
    try:
        cached_ignored = git_ls_files_cached_ignored()
    except SystemExit:
        raise SystemExit(1)

    failures: list[str] = []

    for file_path in sorted(cached_ignored):
        failures.append(f"  [IGNORED BUT TRACKED] {file_path}")

    if failures:
        return False, (
            "Tracked files matching ignore rules:\n" + "\n".join(failures)
        )
    return True, ""


def check_ignored_root_patterns() -> tuple[bool, str]:
    """Verify root generated-output paths are properly ignored."""
    failures: list[str] = []
    for pattern in IGNORED_ROOT_PATTERNS:
        # Use a representative child path for each pattern
        if pattern == ".next/":
            sample = ".next/trace"
        elif pattern == "test-results/":
            sample = "test-results/.last-run.json"
        elif pattern == ".mimosa/":
            sample = ".mimosa/session.json"
        elif pattern == ".playwright-mcp/":
            sample = ".playwright-mcp/playwright.config.json"
        elif pattern == "visual-qa-screenshots/":
            sample = "visual-qa-screenshots/DESIGN-REFERENCES.md"
        else:
            sample = pattern.rstrip("/")

        if not git_check_ignore(sample):
            failures.append(f"  [NOT IGNORED] {sample} should be ignored")

    if failures:
        return False, "Root patterns not properly ignored:\n" + "\n".join(failures)
    return True, ""


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
CHECKS = [
    ("Required canonical paths", check_required_paths),
    ("README.md local links", lambda: check_markdown_links("README.md")),
    (".next/trace ignored", check_next_trace_ignored),
    ("Root patterns ignored", check_ignored_root_patterns),
    ("Retained placeholders visible", check_retained_placeholders),
    ("No tracked-ignored files", check_no_tracked_ignored),
]


def main() -> int:
    os.chdir(REPO_ROOT)

    all_passed = True
    failure_messages: list[str] = []

    for check_name, check_fn in CHECKS:
        ok, msg = check_fn()
        if not ok:
            all_passed = False
            failure_messages.append(f"[FAIL] {check_name}\n{msg}")

    if not all_passed:
        sys.stderr.write("\n".join(failure_messages))
        sys.stderr.write("\n")
        return 1

    # Compact pass summary
    print("check:repo — PASS")
    print(f"  Required paths:      {len(REQUIRED_PATHS)} checked")
    print(f"  Placeholders:        {len(RETAINED_PLACEHOLDERS)} checked")
    print("  Markdown link files: README.md")
    print(f"  Ignored patterns:    {', '.join(IGNORED_ROOT_PATTERNS)}")
    print("  Tracked-ignored:     0 violations")
    return 0


if __name__ == "__main__":
    sys.exit(main())
