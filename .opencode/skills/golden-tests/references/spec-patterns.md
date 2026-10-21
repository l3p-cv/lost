# Spec Patterns — RouteSpec authoring rules and examples

How to write spec entries in `backend/tests/compare/<name>_specs.py`. All examples
are verbatim from the repo (file + line numbers) — match this style exactly.

## Naming

- Spec name: `METHOD_<sanitized_path>` — the `RouteSpec.name` becomes the golden
  filename AND the pytest id: `GET_group_list`, `POST_group_create`,
  `DELETE_group_not_found`, `GET_pipeline_by_id`
- Follow-up requests: `label="<SPEC_NAME>__then_GET"` → own golden file
- Keep the numbered route comments in spec files (`# 3. POST /api/group — ...`)

## Mode selection

| Route kind | Mode | Notes |
| --- | --- | --- |
| DB-dependent list/detail | `structural` (default) | keys/types/nesting only; list lengths ignored |
| Static routes | `exact` | deep-equal after normalization |
| Error paths (D2) | `exact` | fixed names + hardcoded nonexistent IDs (`999999`); no setup/cleanup |
| Binary payloads | `binary` | currently ALL binary-download routes are skipped instead — prefer `skip=True` + reason |
| Non-deterministic / destructive | `skip=True` | `skip_reason` is documentation for future readers |

## Mechanisms

- **`{placeholder}` substitution** — `setup(dbm)` returns a context dict; the runner
  substitutes `{key}` occurrences in request path/json with `str(value)`
- **`context["skip"]`** — set to `True` when a seeded entity is missing → runner
  calls `pytest.skip("... — run init_test_data.py")`
- **`context["fresh_token"]`** — override auth for non-admin identities (user,
  filebrowser, sia, pipeline, annotasks use this)
- **`cleanup(dbm, context)`** — always runs in `finally`; make it IDEMPOTENT
  (delete-if-exists) and `dbm.session.rollback()` first in case a failed request
  left a transaction open
- **Repeatable-read trap** — `dbm.session.rollback()` before any by-name lookup
  through the session-scoped `dbm` after an API commit
- **Never hardcode IDs** — resolve seeded entities by name via
  `tests/helpers/lookups.py`; sole exception: nonexistent `999999` in exact-mode
  error specs

## Example 1 — GET with path param + setup context

From `backend/tests/compare/pipeline_specs.py` (imports:9-17, setup:20-36, spec:107-113):

```python
from tests.helpers.recorder import RequestSpec
from tests.helpers.specs import RouteSpec
from tests.compare.migration_status import target_for

_TARGET = target_for("pipeline")


def _setup_pipe_context(dbm):
    """Look up compare_test_sia_pipe + its PipeElement + the annotask ID."""
    from tests.helpers.lookups import (
        get_test_sia_pipe_id,
        get_test_sia_pipe_element_id,
        get_test_sia_annotask_id,
    )

    pipe_id = get_test_sia_pipe_id(dbm)
    if pipe_id is None:
        return {"skip": True}
    return {
        "pipe_id": pipe_id,
        "pipe_element_id": get_test_sia_pipe_element_id(dbm),
        "annotask_id": get_test_sia_annotask_id(dbm),
        "skip": False,
    }


specs.append(RouteSpec(
    name="GET_pipeline_by_id",
    request=RequestSpec(method="GET", path="/api/pipeline/{pipe_id}", mode="structural"),
    target=_TARGET,
    setup=_setup_pipe_context,
))
```

## Example 2 — POST + follow-up GET + cleanup by name

From `backend/tests/compare/group_specs.py` (spec:86-102; `_cleanup_created_group_by_name`:45-53):

```python
suffix = unique_suffix()
group_name = f"{TEST_PREFIX}{suffix}"
specs.append(RouteSpec(
    name="POST_group_create",
    request=RequestSpec(
        method="POST", path="/api/group",
        json={"group_name": group_name}, mode="structural",
    ),
    follow_up=RequestSpec(
        method="GET", path="/api/group", mode="structural",
        label="POST_group_create__then_GET",
    ),
    target=_TARGET,
    setup=lambda dbm: {"group_name": group_name},
    cleanup=_cleanup_created_group_by_name,
))
```

The cleanup finds the created group BY NAME (rollback-first) and deletes it if the
POST actually created it — safe even when the POST failed.

## Example 3 — error path, exact mode, nonexistent ID

From `backend/tests/compare/group_specs.py` (spec:140-148):

```python
specs.append(RouteSpec(
    name="DELETE_group_not_found",
    request=RequestSpec(
        method="DELETE", path="/api/group/999999", mode="exact",
    ),
    target=_TARGET,
))
```

Error-path conventions (D2): exact mode, no setup, no cleanup (errors fire before
any write), hardcoded implausible ID for determinism — never `unique_suffix()`
in exact bodies.

## Example 4 — skipped with documented reason

From `backend/tests/compare/dataset_specs.py` (spec:261-273) — a stateful
navigation route:

```python
specs.append(RouteSpec(
    name="POST_dataset_review",
    request=RequestSpec(
        method="POST",
        path="/api/datasets/{dataset_id}/review",
        json={"direction": "first"},
        mode="structural",
    ),
    setup=_setup_dataset_context,
    skip=True,
    skip_reason="Stateful navigation — advances through images, returns different data on each run. Non-deterministic. Verified manually in P1.2.",
))
```

Same pattern for binary downloads (`dataset_specs.py:373-378`): recorder cannot
snapshot binary responses yet → `skip=True` with a reason referencing manual
verification. Kept in the file so the route's absence from the goldens is
self-explaining.
