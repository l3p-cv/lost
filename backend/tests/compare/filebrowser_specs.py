"""Filebrowser namespace request specs for golden-snapshot testing.

12 routes: 9 active (read-only GETs + POSTs + upload), 5 skipped (destructive mutations + complex).

Self-contained: uses OOTB 'default' filesystem (idx looked up by name, seeded by initlost).
No new init_test_data.py additions needed.
"""

from __future__ import annotations

import os

from tests.helpers.recorder import RequestSpec
from tests.helpers.specs import RouteSpec
from tests.compare.migration_status import target_for
from tests.helpers.seed import cleanup_test_user, create_test_user

_TARGET = target_for("filebrowser")

# OOTB default filesystem root path
OOTB_FS_ROOT = "/home/lost/data"

# OOTB VOC2012 image folder for validate-datasource test
OOTB_VOC2012_IMG_PATH = "/home/lost/data/1/media/images/10_voc2012"


def _setup_fs_context(dbm):
    """Look up the OOTB 'default' filesystem ID by name."""
    from tests.helpers.lookups import get_default_fs_id

    fs_id = get_default_fs_id(dbm)
    if fs_id is None:
        return {"skip": True}
    return {"fs_id": fs_id, "skip": False}

def _setup_designer_no_admin(dbm) -> dict:
    """Create a designer-without-admin test user and mint its token.

    Used by the local-fs role-quirk specs: the legacy contract answers
    non-admin local-fs access with 403/401 string bodies. Minting happens
    AFTER the designer role commit so the token payload sees the role.
    """
    from lost.controllers.user.login_manager import LoginManager
    from lost.db import roles as db_roles
    from lost.db.model import UserRoles

    user = create_test_user(dbm)
    designer = dbm.get_role_by_name(db_roles.DESIGNER)
    dbm.save_obj(UserRoles(user_id=user.idx, role_id=designer.idx))
    dbm.commit()
    lm = LoginManager(dbm, user.user_name, "")
    fresh_token, _ = lm.create_jwt_pyjwt(user.idx, user.user_name, user.roles)
    return {"fresh_token": fresh_token, "user_obj": user}


def _cleanup_designer_no_admin(dbm, context) -> None:
    """Delete the designer-without-admin test user (rollback-first, idempotent)."""
    if "user_obj" in context:
        cleanup_test_user(dbm, context["user_obj"])


def get_filebrowser_specs() -> list[RouteSpec]:
    specs: list[RouteSpec] = []

    # --- Simple GETs ---

    # 1. GET /api/fb/fslist/all — list all filesystems (designer)
    specs.append(RouteSpec(
        name="GET_fb_fslist_all",
        request=RequestSpec(method="GET", path="/api/fb/fslist/all", mode="structural"),
        target=_TARGET,
    ))

    # 2. GET /api/fb/fstypes — list fs types (admin sees "file" type too)
    specs.append(RouteSpec(
        name="GET_fb_fstypes",
        request=RequestSpec(method="GET", path="/api/fb/fstypes", mode="exact"),
        target=_TARGET,
    ))

    # --- Read-only POSTs (need fs_id from setup) ---

    # 3. POST /api/fb/ls — list directory
    specs.append(RouteSpec(
        name="POST_fb_ls",
        request=RequestSpec(
            method="POST", path="/api/fb/ls",
            json={"fs": {"id": "{fs_id}"}, "path": OOTB_FS_ROOT},
            mode="structural",
        ),
        setup=_setup_fs_context,
        target=_TARGET,
    ))

    # 4. POST /api/fb/fullfs — get filesystem details
    specs.append(RouteSpec(
        name="POST_fb_fullfs",
        request=RequestSpec(
            method="POST", path="/api/fb/fullfs",
            json={"id": "{fs_id}"},
            mode="structural",
        ),
        setup=_setup_fs_context,
        target=_TARGET,
    ))

    # 5. POST /api/fb/check-path — check if path exists
    specs.append(RouteSpec(
        name="POST_fb_check_path",
        request=RequestSpec(
            method="POST", path="/api/fb/check-path",
            json={"fsId": "{fs_id}", "path": OOTB_FS_ROOT},
            mode="exact",
        ),
        setup=_setup_fs_context,
        target=_TARGET,
    ))

    # 6. POST /api/fb/validate-datasource — validate image folder
    specs.append(RouteSpec(
        name="POST_fb_validate_datasource",
        request=RequestSpec(
            method="POST", path="/api/fb/validate-datasource",
            json={
                "fsId": "{fs_id}",
                "path": OOTB_VOC2012_IMG_PATH,
                "expectedType": "imageFolder",
                "validExtensions": ["jpg", "jpeg", "png", "bmp", "tif", "tiff"],
                "recursive": True,
            },
            mode="exact",
        ),
        setup=_setup_fs_context,
        target=_TARGET,
    ))

    # --- Skipped: destructive mutations + complex ---

    specs.append(RouteSpec(
        name="POST_fb_lsTest",
        request=RequestSpec(method="POST", path="/api/fb/lsTest"),
        skip=True,
        skip_reason="Tests arbitrary fs connection — needs admin for 'file' type, complex setup. Verified manually in P1.2.",
    ))

    specs.append(RouteSpec(
        name="POST_fb_rm",
        request=RequestSpec(method="POST", path="/api/fb/rm"),
        skip=True,
        skip_reason="Destructive — deletes files from filesystem. Verified manually in P1.2.",
    ))

    specs.append(RouteSpec(
        name="POST_fb_delete",
        request=RequestSpec(method="POST", path="/api/fb/delete"),
        skip=True,
        skip_reason="Destructive — deletes filesystem entry. Verified manually in P1.2.",
    ))

    specs.append(RouteSpec(
        name="POST_fb_savefs",
        request=RequestSpec(method="POST", path="/api/fb/savefs"),
        skip=True,
        skip_reason="Mutation — creates/updates filesystem entries. Verified manually in P1.2.",
    ))

    # 7. POST /api/fb/upload — file upload (multipart) → cleanup delete uploaded file
    specs.append(RouteSpec(
        name="POST_fb_upload",
        request=RequestSpec(
            method="POST", path="/api/fb/upload",
            data={"fsId": "{fs_id}", "path": OOTB_FS_ROOT + "/test_uploads"},
            files={"file[]": ("compare_test_upload.txt", b"test content from golden snapshots\n", "text/plain")},
            mode="structural",
        ),
        setup=_setup_fs_context,
        cleanup=_cleanup_uploaded_file,
        target=_TARGET,
    ))

    specs.append(RouteSpec(
        name="POST_fb_mkdirs",
        request=RequestSpec(method="POST", path="/api/fb/mkdirs"),
        skip=True,
        skip_reason="Creates directories on filesystem — reversible but risky. Verified manually in P1.2.",
    ))

    # 8. POST /api/fb/lsTest — local 'file' type as designer-without-admin → 403 (exact)
    specs.append(RouteSpec(
        name="POST_fb_ls_test_local_forbidden",
        request=RequestSpec(
            method="POST", path="/api/fb/lsTest",
            json={"fs": {"fsType": "file", "connection": "{}", "rootPath": "/tmp"},
                  "path": "/tmp"},
            mode="exact",
        ),
        setup=_setup_designer_no_admin,
        cleanup=_cleanup_designer_no_admin,
        target=_TARGET,
        # role check fires before any connection parsing — no fs access
    ))

    # 9. POST /api/fb/savefs — save local 'file' fs (no id → create) as
    #    designer-without-admin → 401 (exact)
    specs.append(RouteSpec(
        name="POST_fb_savefs_local_forbidden",
        request=RequestSpec(
            method="POST", path="/api/fb/savefs",
            json={"visLevel": "user", "fsType": "file", "connection": "{}",
                  "rootPath": "/tmp", "name": "compare_test_local_fs"},
            mode="exact",
        ),
        setup=_setup_designer_no_admin,
        cleanup=_cleanup_designer_no_admin,
        target=_TARGET,
        # LocalFsAdminRequiredError fires before any write — only the user needs cleanup
    ))

    return specs


def _cleanup_uploaded_file(dbm, context):
    """Delete the file uploaded by POST /api/fb/upload."""
    upload_path = os.path.join(OOTB_FS_ROOT, "test_uploads", "compare_test_upload.txt")
    try:
        if os.path.exists(upload_path):
            os.remove(upload_path)
    except Exception:
        pass


def get_active_filebrowser_specs() -> list[RouteSpec]:
    return [s for s in get_filebrowser_specs() if not s.skip]
