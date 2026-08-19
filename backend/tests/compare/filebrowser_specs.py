"""Filebrowser namespace request specs for golden-snapshot testing.

12 routes: 6 active (read-only GETs + POSTs), 6 skipped (destructive mutations + file upload).

Self-contained: uses OOTB 'default' filesystem (idx looked up by name, seeded by initlost).
No new init_test_data.py additions needed.
"""

from __future__ import annotations

from tests.helpers.recorder import RequestSpec
from tests.compare.user_specs import RouteSpec

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


def get_filebrowser_specs() -> list[RouteSpec]:
    specs: list[RouteSpec] = []

    # --- Simple GETs ---

    # 1. GET /api/fb/fslist/all — list all filesystems (designer)
    specs.append(RouteSpec(
        name="GET_fb_fslist_all",
        request=RequestSpec(method="GET", path="/api/fb/fslist/all", mode="structural"),
    ))

    # 2. GET /api/fb/fstypes — list fs types (admin sees "file" type too)
    specs.append(RouteSpec(
        name="GET_fb_fstypes",
        request=RequestSpec(method="GET", path="/api/fb/fstypes", mode="exact"),
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

    specs.append(RouteSpec(
        name="POST_fb_upload",
        request=RequestSpec(method="POST", path="/api/fb/upload"),
        skip=True,
        skip_reason="File upload (multipart) — writes to filesystem. Verified manually in P1.2.",
    ))

    specs.append(RouteSpec(
        name="POST_fb_mkdirs",
        request=RequestSpec(method="POST", path="/api/fb/mkdirs"),
        skip=True,
        skip_reason="Creates directories on filesystem — reversible but risky. Verified manually in P1.2.",
    ))

    return specs


def get_active_filebrowser_specs() -> list[RouteSpec]:
    return [s for s in get_filebrowser_specs() if not s.skip]
