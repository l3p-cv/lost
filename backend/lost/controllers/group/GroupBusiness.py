"""Group business layer — group-management domain logic.

No legacy lost/logic counterpart existed; all logic was inline in the
endpoint. Holds the module-specific rules (creation, duplicate check,
deletion). Domain errors are self-describing ``DomainError`` subclasses —
the single handler in fastapi_app.py maps them to the legacy bodies.

Dynamic legacy bodies (interpolated names) are produced by overriding
``http_body`` per instance — the canonical pattern for interpolated messages.
"""
from __future__ import annotations

from lost.controllers.Exceptions import DomainError
from lost.db import model


class GroupNameRequiredError(DomainError):
    """A group was created without a name."""

    http_status = 400
    http_body = "A group name is required."


class GroupAlreadyExistsError(DomainError):
    """A group with the requested name already exists."""

    http_status = 409

    def __init__(self, group_name: str) -> None:
        super().__init__(group_name)
        self.http_body = f"Group with name '{group_name}' already exists."


class GroupNotFoundError(DomainError):
    """The requested group does not exist."""

    http_status = 400

    def __init__(self, group_id: int) -> None:
        super().__init__(group_id)
        self.http_body = f"Group with ID '{group_id}' not found."


class GroupBusiness:
    """Group business service — group CRUD for the coordination layer."""

    def __init__(self, dbm) -> None:
        self.dbm = dbm

    def list_groups(self, user):
        """All groups excluding user defaults."""
        return self.dbm.get_user_groups(user_defaults=False)

    def create_group(self, user, group_name: str) -> None:
        """Create a group with the current user as manager."""
        if not group_name:
            raise GroupNameRequiredError("group name is required")
        if self.dbm.get_group_by_name(group_name):
            raise GroupAlreadyExistsError(group_name)
        group = model.Group(name=group_name, manager_id=user.idx)
        self.dbm.save_obj(group)
        self.dbm.commit()

    def get_group(self, group_id: int):
        return self.dbm.get_group_by_id(group_id)

    def delete_group(self, group_id: int) -> None:
        group = self.dbm.get_group_by_id(group_id)
        if not group:
            raise GroupNotFoundError(group_id)
        self.dbm.delete(group)
        self.dbm.commit()