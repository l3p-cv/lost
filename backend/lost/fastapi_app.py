"""FastAPI application factory for LOST.

Start: uvicorn lost.fastapi_app:app --reload
Routes: flat /api/<namespace> (19 namespaces, migrated from Flask in P1.2)
Profiling: lost.controllers.base.ProfilingRoute (timing + Graylog)
"""

from __future__ import annotations

import logging
import threading
import traceback

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, PlainTextResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.middleware.sessions import SessionMiddleware

from lost import settings
from lost.controllers.Exceptions import DomainError
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
    {"name": "auth/openid"},
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

@app.exception_handler(StarletteHTTPException)
async def handle_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"message": exc.detail},
    )

# Dask background thread (mirrors Flask app.py:156)

# --- Domain-error handler (self-describing exceptions carry their legacy bodies) ---

@app.exception_handler(DomainError)
async def handle_domain_error(request: Request, exc: DomainError):
    logger.warning("Domain error: %s: %s", type(exc).__name__, exc)
    if exc.http_media_type == "text/plain":
        return PlainTextResponse(exc.http_body, status_code=exc.http_status)
    return JSONResponse(status_code=exc.http_status, content=exc.http_body)

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
from lost.controllers.annotasks.AnnotasksEndpoint import router as annotasks_router
from lost.controllers.auth.OpenidEndpoint import router as auth_router
from lost.controllers.config.ConfigEndpoint import router as config_router
from lost.controllers.data.DataEndpoint import router as data_router
from lost.controllers.dataset.DatasetEndpoint import router as dataset_router
from lost.controllers.filebrowser.FileBrowserEndpoint import router as fb_router
from lost.controllers.group.GroupEndpoint import router as group_router
from lost.controllers.inference_model.InferenceModelEndpoint import router as inference_model_router
from lost.controllers.instructionmedia.InstructionMediaEndpoint import router as instructionmedia_router
from lost.controllers.instructions.InstructionEndpoint import router as instruction_router
from lost.controllers.label.LabelEndpoint import router as label_router
from lost.controllers.mia.MiaEndpoint import router as mia_router
from lost.controllers.pipeline.PipelineEndpoint import router as pipeline_router
from lost.controllers.sia.SiaEndpoint import router as sia_router
from lost.controllers.statistics.StatisticsEndpoint import router as statistics_router
from lost.controllers.system.SystemEndpoint import router as system_router
from lost.controllers.user.UserEndpoint import router as user_router
from lost.controllers.worker.WorkerEndpoint import router as worker_router

app.include_router(system_router, prefix=API_PREFIX + "/system")
app.include_router(worker_router, prefix=API_PREFIX + "/worker")
app.include_router(label_router, prefix=API_PREFIX + "/label")
app.include_router(group_router, prefix=API_PREFIX + "/group")
app.include_router(user_router, prefix=API_PREFIX + "/user")
app.include_router(fb_router, prefix=API_PREFIX + "/fb")
app.include_router(instruction_router, prefix=API_PREFIX + "/instructions")
app.include_router(statistics_router, prefix=API_PREFIX + "/statistics")
app.include_router(config_router, prefix=API_PREFIX + "/config")
app.include_router(data_router, prefix=API_PREFIX + "/data")
app.include_router(dataset_router, prefix=API_PREFIX + "/datasets")
app.include_router(sia_router, prefix=API_PREFIX + "/sia")
app.include_router(mia_router, prefix=API_PREFIX + "/mia")
app.include_router(pipeline_router, prefix=API_PREFIX + "/pipeline")
app.include_router(annotasks_router, prefix=API_PREFIX + "/annotasks")
app.include_router(instructionmedia_router, prefix=API_PREFIX + "/media")
app.include_router(auth_router, prefix=API_PREFIX + "/auth/openid")
app.include_router(inference_model_router, prefix=API_PREFIX + "/models")
