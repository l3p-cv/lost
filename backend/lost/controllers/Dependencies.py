"""Endpoint-layer wiring — per-request dependency factories.

Holds ALL endpoint wiring: authentication (get_current_user / require_role,
moved from auth/dependencies.py) and the per-module coordination service
factories. Layers below the endpoint (coordination/business) never import
this file — it imports fastapi and knows the whole object graph.
"""
from __future__ import annotations

import jwt as pyjwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from lost.controllers.AuthorizationService import AuthorizationService
from lost.controllers.label.LabelBusiness import LabelBusiness
from lost.controllers.label.LabelCoordination import LabelCoordination
from lost.controllers.group.GroupBusiness import GroupBusiness
from lost.controllers.group.GroupCoordination import GroupCoordination
from lost.controllers.worker.WorkerBusiness import WorkerBusiness
from lost.controllers.worker.WorkerCoordination import WorkerCoordination
from lost.controllers.system.SystemBusiness import SystemBusiness
from lost.controllers.system.SystemCoordination import SystemCoordination
from lost.controllers.config.ConfigBusiness import ConfigBusiness
from lost.controllers.config.ConfigCoordination import ConfigCoordination
from lost.controllers.statistics.StatisticsBusiness import StatisticsBusiness
from lost.controllers.statistics.StatisticsCoordination import StatisticsCoordination
from lost.controllers.instructions.InstructionBusiness import InstructionBusiness
from lost.controllers.instructions.InstructionCoordination import InstructionCoordination
from lost.controllers.instructionmedia.InstructionMediaBusiness import InstructionMediaBusiness
from lost.controllers.instructionmedia.InstructionMediaCoordination import InstructionMediaCoordination
from lost.controllers.data.DataBusiness import DataBusiness
from lost.controllers.data.DataCoordination import DataCoordination
from lost.controllers.inference_model.InferenceModelBusiness import InferenceModelBusiness
from lost.controllers.inference_model.InferenceModelCoordination import InferenceModelCoordination
from lost.controllers.user.UserBusiness import UserBusiness
from lost.controllers.user.UserCoordination import UserCoordination
from lost.controllers.filebrowser.FileBrowserBusiness import FileBrowserBusiness
from lost.controllers.filebrowser.FileBrowserCoordination import FileBrowserCoordination
from lost.controllers.mia.MiaBusiness import MiaBusiness
from lost.controllers.mia.MiaCoordination import MiaCoordination
from lost.controllers.sia.SiaBusiness import SiaBusiness
from lost.controllers.sia.SiaCoordination import SiaCoordination
from lost.controllers.dataset.DatasetBusiness import DatasetBusiness
from lost.controllers.dataset.DatasetCoordination import DatasetCoordination
from lost.controllers.pipeline.PipelineBusiness import PipelineBusiness
from lost.controllers.pipeline.PipelineCoordination import PipelineCoordination

from lost.db.model import User as DBUser
from lost.db.access import DBMan
from lost.db.session import get_db
from lost.db.redis import is_token_revoked
from lost.settings import LOST_CONFIG

# Bearer token scheme for Swagger UI "Authorize" button
oauth2_scheme = HTTPBearer()

SECRET_KEY = LOST_CONFIG.secret_key
ALGORITHM = "HS256"


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(oauth2_scheme),
    dbm: DBMan = Depends(get_db),
) -> DBUser:
    """Decode JWT, check blacklist, load User from DB."""
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    token = credentials.credentials
    try:
        payload = pyjwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload.get("sub", 0))
        jti = payload.get("jti")
    except pyjwt.PyJWTError:
        raise credentials_exception
    if is_token_revoked(jti):
        raise HTTPException(status_code=401, detail="Token has been revoked")
    user = dbm.get_user_by_id(user_id)
    if user is None:
        raise credentials_exception
    return user


def require_role(*allowed_roles: str):
    """Dependency factory: require the authenticated user to have one of the given roles."""

    def dependency(user: DBUser = Depends(get_current_user)) -> DBUser:
        if not user.has_role(*allowed_roles):
            raise HTTPException(
                status_code=403,
                detail=f"You need to be one of {allowed_roles} in order to perform this request.",
            )
        return user

    return dependency

# --- Coordination service factories ---
# these are used in the endpoints to wire the coordination services with their dependencies. 
# Each factory returns a new instance of the coordination service, which is then injected into the endpoint function.

def get_label_coordination(dbm: DBMan = Depends(get_db)) -> LabelCoordination:
    """Wire the label coordination service with its collaborators."""
    return LabelCoordination(LabelBusiness(dbm, AuthorizationService()))

def get_group_coordination(dbm: DBMan = Depends(get_db)) -> GroupCoordination:
    """Wire the group coordination service with its collaborators."""
    return GroupCoordination(GroupBusiness(dbm))

def get_worker_coordination(dbm: DBMan = Depends(get_db)) -> WorkerCoordination:
    """Wire the worker coordination service with its collaborators."""
    return WorkerCoordination(WorkerBusiness(dbm))

def get_system_coordination() -> SystemCoordination:
    """Wire the system coordination service with its collaborators."""
    return SystemCoordination(SystemBusiness())

def get_config_coordination(dbm: DBMan = Depends(get_db)) -> ConfigCoordination:
    """Wire the config coordination service with its collaborators."""
    return ConfigCoordination(ConfigBusiness(dbm))

def get_statistics_coordination(dbm: DBMan = Depends(get_db)) -> StatisticsCoordination:
    """Wire the statistics coordination service with its collaborators."""
    return StatisticsCoordination(StatisticsBusiness(dbm))

def get_instructions_coordination(dbm: DBMan = Depends(get_db)) -> InstructionCoordination:
    """Wire the instructions coordination service with its collaborators."""
    return InstructionCoordination(InstructionBusiness(dbm))

def get_instructionmedia_coordination(dbm: DBMan = Depends(get_db)) -> InstructionMediaCoordination:
    """Wire the instruction media coordination service with its collaborators."""
    return InstructionMediaCoordination(InstructionMediaBusiness(dbm))

def get_data_coordination(dbm: DBMan = Depends(get_db)) -> DataCoordination:
    """Wire the data coordination service with its collaborators."""
    return DataCoordination(DataBusiness(dbm))

def get_inference_model_coordination(dbm: DBMan = Depends(get_db)) -> InferenceModelCoordination:
    """Wire the inference model coordination service with its collaborators."""
    return InferenceModelCoordination(InferenceModelBusiness(dbm))

def get_user_coordination(dbm: DBMan = Depends(get_db)) -> UserCoordination:
    """Wire the user coordination service with its collaborators"""
    return UserCoordination(UserBusiness(dbm))

def get_filebrowser_coordination(dbm: DBMan = Depends(get_db)) -> FileBrowserCoordination:
    """Wire the filebrowser coordination service with its collaborators"""
    return FileBrowserCoordination(FileBrowserBusiness(dbm))

def get_mia_coordination(dbm: DBMan = Depends(get_db)) -> MiaCoordination:
    """Wire the mia coordination service with its collaborators"""
    return MiaCoordination(MiaBusiness(dbm))

def get_sia_coordination(dbm: DBMan = Depends(get_db)) -> SiaCoordination:
    """Wire the sia coordination service with its collaborators"""
    return SiaCoordination(SiaBusiness(dbm ,AuthorizationService()))

def get_dataset_coordination(dbm: DBMan = Depends(get_db)) -> DatasetCoordination:
    """Wire the dataset coordination service with its collaborators."""
    return DatasetCoordination(DatasetBusiness(dbm))

def get_pipeline_coordination(dbm: DBMan = Depends(get_db)) -> PipelineCoordination:
    """Wire the pipeline coordination service with its collaborators."""
    return PipelineCoordination(PipelineBusiness(dbm))