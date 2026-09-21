"""Inference model namespace request specs for golden-snapshot testing.

5 routes (URL prefix /api/models):
- GET    /api/models          — list all inference models
- GET    /api/models/{id}     — get model by id
- POST   /api/models          — create model (unique displayName) → GET verify
- PUT    /api/models/{id}     — update model → GET verify
- DELETE /api/models/{id}     — delete model (JWT-protected) → GET verify 404

The seeded model (compare_test Dummy YOLO) is created by init_test_data.py
and used as the stable target for GET-by-id. POST/PUT/DELETE create their
own ephemeral test models in setup() and clean them up afterwards.
"""

from __future__ import annotations

from tests.helpers.recorder import RequestSpec
from tests.helpers.seed import unique_suffix, TEST_PREFIX
from tests.helpers.specs import RouteSpec
from tests.compare.migration_status import target_for

_TARGET = target_for("inference_model")

# Display name of the model seeded by init_test_data.py
SEED_DISPLAY_NAME = f"{TEST_PREFIX}Dummy YOLO"


def _find_seeded_model_id(dbm) -> int | None:
    """Return the idx of the seeded test inference model, or None."""
    from lost.db.model import InferenceModel

    im = dbm.session.query(InferenceModel).filter_by(
        display_name=SEED_DISPLAY_NAME
    ).first()
    return im.idx if im else None


def _create_test_model_db(dbm) -> dict:
    """Create an ephemeral test inference model directly in the DB.

    Returns context with model_id and display_name for path substitution
    and cleanup.
    """
    from lost.db.model import InferenceModel

    suffix = unique_suffix()
    display_name = f"{TEST_PREFIX}Dummy {suffix}"
    im = InferenceModel(
        name=f"{TEST_PREFIX}model_{suffix}",
        display_name=display_name,
        server_url="localhost:8001",
        task_type=0,
        model_type="YOLO",
        description="ephemeral test model",
    )
    dbm.save_obj(im)
    dbm.commit()
    return {"model_id": im.idx, "display_name": display_name}


def _cleanup_test_model_db(dbm, context: dict) -> None:
    """Delete a test inference model from the DB by display_name (idempotent)."""
    from lost.db.model import InferenceModel

    display_name = context.get("display_name")
    if not display_name:
        return
    im = dbm.session.query(InferenceModel).filter_by(
        display_name=display_name
    ).first()
    if im:
        dbm.session.delete(im)
        dbm.commit()


def _cleanup_test_model_by_id(dbm, context: dict) -> None:
    """Delete a test inference model by id (safe if already deleted via API)."""
    from lost.db.model import InferenceModel

    model_id = context.get("model_id")
    if not model_id:
        return
    im = dbm.session.query(InferenceModel).filter_by(idx=model_id).first()
    if im:
        dbm.session.delete(im)
        dbm.commit()


def get_inference_model_specs() -> list[RouteSpec]:
    specs: list[RouteSpec] = []

    # 1. GET /api/models — list all inference models
    specs.append(RouteSpec(
        name="GET_models_list",
        request=RequestSpec(method="GET", path="/api/models", mode="structural"),
        target=_TARGET,
    ))

    # 2. GET /api/models/{id} — get seeded model by id
    specs.append(RouteSpec(
        name="GET_model_by_id",
        request=RequestSpec(
            method="GET", path="/api/models/{model_id}", mode="structural",
        ),
        setup=lambda dbm: {"model_id": _find_seeded_model_id(dbm)},
        target=_TARGET,
    ))

    # 3. POST /api/models — create model via API → GET verify → cleanup by name
    suffix = unique_suffix()
    create_display_name = f"{TEST_PREFIX}Dummy {suffix}"
    create_body = {
        "name": f"{TEST_PREFIX}model_{suffix}",
        "displayName": create_display_name,
        "serverUrl": "localhost:8001",
        "taskType": 0,
        "modelType": "YOLO",
        "description": "created via API",
    }
    specs.append(RouteSpec(
        name="POST_model_create",
        request=RequestSpec(
            method="POST", path="/api/models",
            json=create_body, mode="structural",
        ),
        follow_up=RequestSpec(
            method="GET", path="/api/models", mode="structural",
            label="POST_model_create__then_GET",
        ),
        setup=lambda dbm: {"display_name": create_display_name},
        cleanup=_cleanup_test_model_db,
        target=_TARGET,
    ))

    # 4. PUT /api/models/{id} — create model in DB → PUT via API → GET verify → cleanup
    put_suffix = unique_suffix()
    put_display_name = f"{TEST_PREFIX}Dummy {put_suffix}"
    put_update_body = {
        "name": f"{TEST_PREFIX}model_{put_suffix}",
        "displayName": f"{put_display_name}_updated",
        "serverUrl": "localhost:8001",
        "taskType": 0,
        "modelType": "YOLO",
        "description": "updated via API",
    }

    def _put_setup(dbm) -> dict:
        from lost.db.model import InferenceModel

        im = InferenceModel(
            name=f"{TEST_PREFIX}model_{put_suffix}",
            display_name=put_display_name,
            server_url="localhost:8001",
            task_type=0,
            model_type="YOLO",
            description="ephemeral test model",
        )
        dbm.save_obj(im)
        dbm.commit()
        return {"model_id": im.idx, "display_name": put_update_body["displayName"]}

    specs.append(RouteSpec(
        name="PUT_model_update",
        request=RequestSpec(
            method="PUT", path="/api/models/{model_id}",
            json=put_update_body, mode="structural",
        ),
        follow_up=RequestSpec(
            method="GET", path="/api/models/{model_id}", mode="structural",
            label="PUT_model_update__then_GET",
        ),
        setup=_put_setup,
        cleanup=_cleanup_test_model_db,
        target=_TARGET,
    ))

    # 5. DELETE /api/models/{id} — create model in DB → DELETE via API → GET verify 404
    specs.append(RouteSpec(
        name="DELETE_model",
        request=RequestSpec(
            method="DELETE", path="/api/models/{model_id}", mode="structural",
        ),
        follow_up=RequestSpec(
            method="GET", path="/api/models/{model_id}", mode="structural",
            label="DELETE_model__then_GET",
        ),
        setup=_create_test_model_db,
        cleanup=_cleanup_test_model_by_id,  # safe if already deleted via API
        target=_TARGET,
    ))

    return specs


def get_active_inference_model_specs() -> list[RouteSpec]:
    return [s for s in get_inference_model_specs() if not s.skip]
