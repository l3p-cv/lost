"""Resource-level authorization utility shared by business layers.

Authentication (who the caller is) is enforced declaratively at the endpoint
layer via ``require_role(...)`` in Dependencies.py. This service covers
resource-level decisions — visibility levels, group membership, ownership —
that business layers need. Framework-free: raises NotAuthorizedError, which
the global exception handler maps to the legacy 403 body.
"""
from __future__ import annotations

from lost.controllers.Exceptions import NotAuthorizedError
from lost.db import roles


class AuthorizationService:
    """Resource-level authorization checks (stateless)."""

    def assert_global_manage(self, user) -> None:
        """Require the administrator role for global-visibility operations."""
        if not user.has_role(roles.ADMINISTRATOR):
            raise NotAuthorizedError("global visibility requires administrator role")

    def default_group(self, dbm, user):
        """Return the user's personal default group.

        Lookup semantics identical to the legacy endpoint — no extra
        None-guard, so a missing group fails exactly like before.
        """
        return dbm.get_group_by_name(user.user_name)

    def allowed_to_mark_example(self, user) -> bool:
        """True if the user may mark an annotation as an example.

        Admins always may; owners of the associated LabelTree's default
        group may (legacy UserPermissions behavior).
        """
        if user.has_role(roles.ADMINISTRATOR):
            return True
        anno_task = user.choosen_anno_tasks[0].anno_task
        for rll in anno_task.req_label_leaves:
            if self._is_users_default_group(user, rll.label_leaf.group_id):
                return True
        return False

    @staticmethod
    def _is_users_default_group(user, group_id: int) -> bool:
        for user_group in user.groups:
            if user_group.group.is_user_default:
                if group_id == user_group.group.idx:
                    return True
        return False
