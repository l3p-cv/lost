# Namespace Flow — full file set for a new API namespace

Use when `backend/tests/compare/<name>_specs.py` does not exist for a namespace whose
router is already mounted. Work the steps in order; STOP at any failed prerequisite.

## 0. Prerequisites — STOP and report if any is missing

- The module exports `router` (`backend/lost/controllers/<Module>/<Module>Endpoint.py`)
- `backend/lost/fastapi_app.py` imports it AND calls
  `app.include_router(<ns>_router, prefix=API_PREFIX + "/<path>")`
- `_OPENPI_TAGS` in `fastapi_app.py` contains a tag for the namespace

Known counter-example: `triton` has a tag but NO mounted router — the flow stops at
this gate until the router is registered. Report what is missing instead of guessing.

## 1. Naming decisions

The harness namespace name drives four places, and for some namespaces the URL
prefix, the spec-file stem, and the `target_for` argument all differ:

| URL prefix | Spec file | Runner | target_for(...) | Golden dir |
| --- | --- | --- | --- | --- |
| /api/annotasks | annotask_specs.py | test_annotask_compare.py | annotasks | annotasks/ |
| /api/datasets | dataset_specs.py | test_dataset_compare.py | datasets | dataset/ |
| /api/instructions | instruction_specs.py | test_instruction_compare.py | instructions | instructions/ |
| /api/fb | filebrowser_specs.py | test_filebrowser_compare.py | filebrowser | filebrowser/ |
| /api/media | instructionmedia_specs.py | test_instructionmedia_compare.py | instructionmedia | instructionmedia/ |
| /api/models | inference_model_specs.py | test_inference_model_compare.py | inference_model | inference_model/ |
| /api/auth/openid | (none — extend backend/tests/auth/ mock tests instead) | test_openid_fastapi.py | auth | (no goldens) |
| all other prefixes | <prefix>_specs.py | test_<prefix>_compare.py | <prefix> | <prefix>/ |

Pick the name, verify the `target_for` argument against `migration_status.MIGRATED`,
and use the SAME name in the spec file, runner, and golden dir (see table for the
three known stem/argument mismatches: annotask/annotasks, dataset/datasets,
instruction/instructions).

## 2. Seeder vs ephemeral decision

- **Persistent entity** (referenced by several specs, or needed across the whole
  suite): extend `backend/tests/helpers/init_test_data.py` — idempotent
  create-if-missing with `compare_test_` prefix — and add a name-based lookup to
  `backend/tests/helpers/lookups.py` (return `None` → runtime skip)
- **Single-test entity**: create it in the spec's `setup(dbm)` and delete it in
  `cleanup(dbm, context)` — ephemeral, no seeder change

## 3. Spec file — `backend/tests/compare/<name>_specs.py`

Skeleton (match the style of existing spec files — numbered route comments,
module docstring with route counts):

```python
"""<Name> namespace request specs for golden-snapshot testing.

N routes: X active, Y skipped.
- <one line per route group>
"""

from __future__ import annotations

from tests.helpers.recorder import RequestSpec
from tests.helpers.specs import RouteSpec
from tests.compare.migration_status import target_for

_TARGET = target_for("<target_for-arg>")


# --- setup/cleanup helpers (only if mutations need entities) ---


def get_<name>_specs() -> list[RouteSpec]:
    specs: list[RouteSpec] = []

    # 1. GET /api/<path> — <route summary>
    specs.append(RouteSpec(
        name="GET_<name>_<what>",
        request=RequestSpec(method="GET", path="/api/<path>", mode="structural"),
        target=_TARGET,
    ))

    return specs


def get_active_<name>_specs() -> list[RouteSpec]:
    return [s for s in get_<name>_specs() if not s.skip]
```

## 4. Runner — pick a template

**Template A — generic** (namespace with simple GETs only; no setup/cleanup, no
`dbm`): adapted from `tests/compare/test_config_compare.py`:

```python
"""Golden-snapshot comparison tests for the <name> namespace."""

from __future__ import annotations

import pytest

from tests.helpers.recorder import RequestSpec, capture, save
from tests.helpers.comparator import load_golden, assert_equal
from tests.compare.<name>_specs import get_active_<name>_specs
from tests.helpers.specs import RouteSpec


def _run_<name>_spec(client, auth_headers, spec: RouteSpec, record: bool):
    req = spec.request
    headers = {**auth_headers, **req.headers}

    live_spec = RequestSpec(
        method=req.method, path=req.path, headers=headers,
        json=req.json, params=req.params, mode=req.mode, label=req.label,
    )
    captured = capture(client, live_spec)
    gpath = f"<name>/{spec.name}.json"

    if record:
        save(gpath, captured)

    golden = load_golden(gpath)
    assert_equal(golden, captured, mode=spec.request.mode)


_ACTIVE_SPECS = get_active_<name>_specs()


@pytest.mark.parametrize(
    "spec,client",
    [(s, s.target) for s in _ACTIVE_SPECS],
    indirect=["client"],
    ids=[s.name for s in _ACTIVE_SPECS],
)
def test_<name>_route(client, auth_headers, record, spec: RouteSpec):
    _run_<name>_spec(client, auth_headers, spec, record=record)
```

**Template B — context-aware** (specs with setup/cleanup/follow_up/runtime skips):
adapted from `tests/compare/test_inference_model_compare.py`:

```python
"""Golden-snapshot comparison tests for the <name> namespace.

Handles:
- Simple GETs (no setup/cleanup)
- Mutations: setup → primary request → follow-up GET → finally cleanup
"""

from __future__ import annotations

import pytest

from tests.helpers.recorder import RequestSpec, capture, save
from tests.helpers.comparator import load_golden, assert_equal
from tests.compare.<name>_specs import get_active_<name>_specs
from tests.helpers.specs import RouteSpec


def _substitute_path(path: str, context: dict) -> str:
    result = path
    for key, value in context.items():
        result = result.replace(f"{{{key}}}", str(value))
    return result


def _run_<name>_spec(client, auth_headers, dbm, spec: RouteSpec, record: bool):
    context: dict = {}

    if spec.setup:
        dbm.session.commit()
        context = spec.setup(dbm)

    if context.get("skip"):
        pytest.skip("compare_test entity not found — run init_test_data.py")

    try:
        # --- Primary request ---
        req = spec.request
        path = _substitute_path(req.path, context)
        headers = {**auth_headers, **req.headers}

        primary_spec = RequestSpec(
            method=req.method, path=path, headers=headers,
            json=req.json, params=req.params, mode=req.mode, label=req.label,
        )
        captured = capture(client, primary_spec)
        gpath = f"<name>/{spec.name}.json"

        if record:
            save(gpath, captured)

        golden = load_golden(gpath)
        assert_equal(golden, captured, mode=spec.request.mode)

        # --- Follow-up request ---
        if spec.follow_up:
            fu = spec.follow_up
            fu_path = _substitute_path(fu.path, context)
            fu_headers = {**auth_headers, **fu.headers}

            fu_spec = RequestSpec(
                method=fu.method, path=fu_path, headers=fu_headers,
                json=fu.json, params=fu.params, mode=fu.mode, label=fu.label,
            )
            fu_captured = capture(client, fu_spec)
            fu_gpath = f"<name>/{fu.label}.json"

            if record:
                save(fu_gpath, fu_captured)

            fu_golden = load_golden(fu_gpath)
            assert_equal(fu_golden, fu_captured, mode=fu.mode)

    finally:
        if spec.cleanup:
            dbm.session.commit()
            spec.cleanup(dbm, context)


_ACTIVE_SPECS = get_active_<name>_specs()


@pytest.mark.parametrize(
    "spec,client",
    [(s, s.target) for s in _ACTIVE_SPECS],
    indirect=["client"],
    ids=[s.name for s in _ACTIVE_SPECS],
)
def test_<name>_route(client, auth_headers, dbm, record, spec: RouteSpec):
    _run_<name>_spec(client, auth_headers, dbm, spec, record=record)
```

Notes: the `dbm.session.commit()` calls around setup/cleanup are the repeatable-read
trap mitigation (see `references/harness-map.md`); `raise_server_exceptions=False`
in the client fixture means 500s come back as responses. Goldens are written to
`backend/tests/golden/<name>/` — the dir is created on first save, but create it in
the same commit when adding goldens by hand.

## 5. Register the namespace

Add the `target_for` argument (see table in step 1) to the `MIGRATED` set in
`backend/tests/compare/migration_status.py`. Without it, `target_for()` returns
`"flask"` and every spec in the new runner hard-fails.

## 6. Record, verify, commit

1. Record (all specs in a NEW runner are new — whole-file record is correct here):
   `./backend/run_snapshots.sh tests/compare/test_<name>_compare.py --record -v`
2. Review the generated `backend/tests/golden/<name>/*.json` diffs — redactions
   applied? right mode? volatile keys that belong in `_REDACTED_KEYS` instead?
3. Verify without `--record`:
   `./backend/run_snapshots.sh tests/compare/test_<name>_compare.py -v`
4. Full suite (catches cross-suite interference):
   `./backend/run_snapshots.sh tests/compare/ -v`
5. Commit specs + goldens together (harness rule). If a recording FAILS, root-cause
   it — never re-record to silence a failure.
