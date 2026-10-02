"""Group business layer — group-management domain logic (D2-pure).

No legacy lost/logic counterpart existed; all logic was inline in the
endpoint. Holds the module-specific rules (creation, duplicate check,
deletion). Domain errors are PLAIN signals (D2): they carry only the data
the endpoint needs — no HTTP vocabulary lives here. GroupEndpoint catches
them and builds the exact legacy responses via Responses.
"""
from __future__ import annotations

from lost.controllers.Exceptions import DomainError
from lost.db import model


class GroupNameRequiredError(DomainError):
    """A group was created without a name."""


class GroupAlreadyExistsError(DomainError):
    """A group with the requested name already exists."""

    def __init__(self, group_name: str) -> None:
        super().__init__(group_name)


class GroupNotFoundError(DomainError):
    """The requested group does not exist."""

    def __init__(self, group_id: int) -> None:
        super().__init__(group_id)


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
