"""Layering guard for the Pass 2 CCB split (Endpoint -> Coordination -> Business).

Static architectural test. Parses the import statements of the layer files
under ``lost/controllers`` and enforces the CCB rules:

* ``<Name>Business.py``     -- framework-free (no fastapi / flask*), never
  imports Endpoint or Coordination modules (one-way: Endpoint -> Coordination
  -> Business).
* ``<Name>Coordination.py`` -- framework-free, never imports Endpoint modules.
* ``SPLIT_MODULES`` registry -- every module registered as "split" must provide
  all three layer files, and every layer file on disk must belong to a
  registered module (catches unregistered half-splits).

The test never imports target code and never touches DB or HTTP, so legacy
reference files (lowercase ``endpoint.py`` etc.) can coexist safely: only
PascalCase ``*Business.py`` / ``*Coordination.py`` files are policed.

Run with the snapshot gate:  ./backend/run_snapshots.sh tests/ -v
"""
from __future__ import annotations

import ast
from pathlib import Path

import pytest

CONTROLLERS = Path(__file__).resolve().parents[2] / "lost" / "controllers"


# Modules that completed their 3-layer split -- grow one entry per Pass 2
# module commit. Mirrors the migration_status.py registry pattern.
SPLIT_MODULES: dict[str, tuple[str, str, str]] = {
    # module dir: (endpoint file, coordination file, business file)
    "auth": ("OpenidEndpoint.py", "OpenidCoordination.py", "OpenidBusiness.py"),
    "label": ("LabelEndpoint.py", "LabelCoordination.py", "LabelBusiness.py"),
    "group": ("GroupEndpoint.py", "GroupCoordination.py", "GroupBusiness.py"),
    "worker": ("WorkerEndpoint.py", "WorkerCoordination.py", "WorkerBusiness.py"),
    "system": ("SystemEndpoint.py", "SystemCoordination.py", "SystemBusiness.py"),
    "config": ("ConfigEndpoint.py", "ConfigCoordination.py", "ConfigBusiness.py"),
    "statistics": ("StatisticsEndpoint.py", "StatisticsCoordination.py", "StatisticsBusiness.py", "PersonalStats.py", "DesignerStats.py"),
}

SHARED_FRAMEWORK_FREE = (
    "AuthorizationService.py",
    "auth/login_manager.py",
)

_INFRA_NAME_BAN = ("Dependencies", "base", "dependencies")
_BUSINESS_SUFFIX_BAN = ("Endpoint", "Coordination")
_COORDINATION_SUFFIX_BAN = ("Endpoint",)


def _business_files() -> list[Path]:
    files = {p for p in CONTROLLERS.rglob("*Business.py")}
    for module_dir, layer_files in SPLIT_MODULES.items():
        for fname in layer_files[2:]:
            full = CONTROLLERS / module_dir / fname
            if full.is_file():
                files.add(full)
    return sorted(files)


def _coordination_files() -> list[Path]:
    return sorted(CONTROLLERS.rglob("*Coordination.py"))


def _imports(path: Path) -> list[tuple[str, int]]:
    """Return ``(module_or_name, level)`` for every import statement in *path*.

    ``level`` is ``0`` for absolute imports and ``>0`` for relative ones --
    e.g. ``from .LabelEndpoint import x`` yields ``("LabelEndpoint", 1)``.
    """
    found: list[tuple[str, int]] = []
    for node in ast.walk(ast.parse(path.read_text(encoding="utf-8"))):
        if isinstance(node, ast.Import):
            found.extend((alias.name, 0) for alias in node.names)
        elif isinstance(node, ast.ImportFrom):
            found.append((node.module or "", node.level))
    return found


def _rel(path: Path) -> str:
    try:
        return str(path.relative_to(CONTROLLERS))
    except ValueError:
        return str(path)


def _forbidden_framework(imports: list[tuple[str, int]]) -> str | None:
    for module, _level in imports:
        root = module.split(".", 1)[0]
        if root == "fastapi" or root.startswith("flask"):
            return module
    return None


def _forbidden_suffix(imports: list[tuple[str, int]], suffixes: tuple[str, ...]) -> str | None:
    for module, level in imports:
        if module.rsplit(".", 1)[-1].endswith(suffixes):
            return f"{'.' * level}{module}"
    return None


@pytest.mark.parametrize("path", _business_files(), ids=_rel)
def test_business_framework_free(path: Path) -> None:
    bad = _forbidden_framework(_imports(path))
    assert bad is None, (
        f"{_rel(path)}: forbidden framework import {bad!r} -- "
        "the business layer must be framework-free (no fastapi/flask)"
    )


@pytest.mark.parametrize("path", _business_files(), ids=_rel)
def test_business_no_upward_imports(path: Path) -> None:
    bad = _forbidden_suffix(_imports(path), _BUSINESS_SUFFIX_BAN)
    assert bad is None, (
        f"{_rel(path)}: upward import {bad!r} -- "
        "business must not import Endpoint/Coordination modules "
        "(dependency direction is Endpoint -> Coordination -> Business)"
    )


@pytest.mark.parametrize("path", _coordination_files(), ids=_rel)
def test_coordination_framework_free(path: Path) -> None:
    bad = _forbidden_framework(_imports(path))
    assert bad is None, (
        f"{_rel(path)}: forbidden framework import {bad!r} -- "
        "the coordination layer must be framework-free (map errors in the Endpoint)"
    )


@pytest.mark.parametrize("path", _coordination_files(), ids=_rel)
def test_coordination_no_endpoint_imports(path: Path) -> None:
    bad = _forbidden_suffix(_imports(path), _COORDINATION_SUFFIX_BAN)
    assert bad is None, (
        f"{_rel(path)}: upward import {bad!r} -- "
        "coordination must not import Endpoint modules"
    )


def test_split_modules_complete() -> None:
    for module_dir, layer_files in SPLIT_MODULES.items():
        for fname in layer_files:
            assert (CONTROLLERS / module_dir / fname).is_file(), (
                f"registered module {module_dir!r} is missing {fname!r} -- "
                "update SPLIT_MODULES if the module is no longer split"
            )


def test_layers_are_registered() -> None:
    registered = set(SPLIT_MODULES)
    for path in _business_files() + _coordination_files():
        module_dir = path.parent.relative_to(CONTROLLERS).parts[0]
        assert module_dir in registered, (
            f"{_rel(path)} belongs to module {module_dir!r} which is not in "
            "SPLIT_MODULES -- finish the 3-layer split and register it"
        )

def _shared_files() -> list[Path]:
    return [CONTROLLERS / rel for rel in SHARED_FRAMEWORK_FREE if (CONTROLLERS / rel).is_file()]


def _forbidden_infra(imports: list[tuple[str, int]]) -> str | None:
    for module, _level in imports:
        if module.rsplit(".", 1)[-1] in _INFRA_NAME_BAN:
            return module
    return None


@pytest.mark.parametrize("path", _shared_files(), ids=_rel)
def test_shared_infra_framework_free(path: Path) -> None:
    bad = _forbidden_framework(_imports(path))
    assert bad is None, (
        f"{_rel(path)}: forbidden framework import {bad!r} -- "
        "shared infra is imported by coordination/business; fastapi would leak transitively"
    )


@pytest.mark.parametrize("path", _shared_files(), ids=_rel)
def test_shared_infra_no_endpoint_imports(path: Path) -> None:
    bad = _forbidden_suffix(_imports(path), _COORDINATION_SUFFIX_BAN)
    assert bad is None, f"{_rel(path)}: upward import {bad!r} -- shared infra must not import Endpoint modules"


@pytest.mark.parametrize(
    "path", _business_files() + _coordination_files() + _shared_files(), ids=_rel,
)
def test_no_endpoint_infra_imports(path: Path) -> None:
    bad = _forbidden_infra(_imports(path))
    assert bad is None, (
        f"{_rel(path)}: endpoint-layer infra import {bad!r} -- "
        "Dependencies/base/auth.dependencies import fastapi and belong to the endpoint layer"
    )
