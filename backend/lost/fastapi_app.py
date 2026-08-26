"""FastAPI application factory for LOST.

Start: uvicorn lost.fastapi_app:app --reload
Routes: flat /api/<namespace> (19 namespaces, migrated from Flask in P1.2)
Profiling: lost.api.base.ProfilingRoute (timing + Graylog)
"""

from __future__ import annotations

import logging
import threading
import traceback

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.sessions import SessionMiddleware

from lost import settings
from lost.logic import dask_session

logger = logging.getLogger("lost")

# Attach Graylog handler once at module load (replaces app.py:38-45)
if settings.LOST_CONFIG.use_graylog:
    from pygelf import GelfUdpHandler

    logging.basicConfig(level=logging.INFO)
    logger.addHandler(
        GelfUdpHandler(host="graylog", port=12201, _type="lost-api", include_extra_fields=True)
    )
    logger.info("Started LOST FastAPI Application.")

API_PREFIX = "/api"

# Pins the grouping/order of route sections in the Swagger UI.
_OPENAPI_TAGS = [
    {"name": "user"},
    {"name": "auth"},
    {"name": "group"},
    {"name": "sia"},
    {"name": "mia"},
    {"name": "pipeline"},
    {"name": "annotasks"},
    {"name": "datasets"},
    {"name": "data"},
    {"name": "label"},
    {"name": "worker"},
    {"name": "fb"},
    {"name": "system"},
    {"name": "statistics"},
    {"name": "config"},
    {"name": "anno_example"},
    {"name": "instructions"},
    {"name": "instructionmedia"},
    {"name": "models"},
    {"name": "triton"},
]

logger.info(
    "startup_config",
    extra={
        "debug": settings.LOST_CONFIG.debug,
        "use_graylog": settings.LOST_CONFIG.use_graylog,
        "worker_management": settings.LOST_CONFIG.worker_management,
    },
)

app = FastAPI(
    title="LOST API",
    description="REST and LOST specific services.",
    version="0.1",
    openapi_tags=_OPENAPI_TAGS,
)

# --- CORS (always-on, all origins, all methods) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
)

# OpenID session (signed cookies)
app.add_middleware(SessionMiddleware, secret_key=settings.SECRET_KEY)

# Error handler (mirrors Flask app.py:109)


@app.exception_handler(Exception)
async def handle_500(request: Request, exc: Exception):
    trace = traceback.format_exc()
    logger.error(trace)

    exception_name: str = type(exc).__name__
    if exception_name == "NotFound":
        return JSONResponse(status_code=404, content=str(exc))

    # general errors (return as 500)
    response = {"error": str(exc), "type": type(exc).__name__}

    # append stack trace in debug mode
    if settings.FLASK_DEBUG:
        response["traceback"] = trace.splitlines()

    return JSONResponse(status_code=500, content=response)


# Dask background thread (mirrors Flask app.py:156)


@app.on_event("startup")
async def startup_event():
    if settings.LOST_CONFIG.worker_management == "dynamic":
        t = threading.Thread(
            target=dask_session.release_client_by_timeout_loop,
            args=(logger.name,),
            daemon=True,
        )
        t.start()


# Routers (added per-namespace in P1.2)
from lost.api.system.SystemEndpoint import router as system_router
from lost.api.worker.WorkerEndpoint import router as worker_router
from lost.api.label.LabelEndpoint import router as label_router
from lost.api.group.GroupEndpoint import router as group_router
from lost.api.user.UserEndpoint import router as user_router
from lost.api.filebrowser.FileBrowserEndpoint import router as fb_router
from lost.api.instructions.InstructionEndpoint import router as instruction_router
from lost.api.statistics.StatisticsEndpoint import router as statistics_router
from lost.api.config.ConfigEndpoint import router as config_router

app.include_router(system_router, prefix=API_PREFIX + "/system")
app.include_router(worker_router, prefix=API_PREFIX + "/worker")
app.include_router(label_router, prefix=API_PREFIX + "/label")
app.include_router(group_router, prefix=API_PREFIX + "/group")
app.include_router(user_router, prefix=API_PREFIX + "/user")
app.include_router(fb_router, prefix=API_PREFIX + "/fb")
app.include_router(instruction_router, prefix=API_PREFIX + "/instructions")
app.include_router(statistics_router, prefix=API_PREFIX + "/statistics")
app.include_router(config_router, prefix=API_PREFIX + "/config")
