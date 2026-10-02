"""Group coordination layer — thin routing of endpoint calls to business.

Flow
----
GroupEndpoint  ->  GroupCoordination  ->  GroupBusiness
"""
from __future__ import annotations

from lost.controllers.group.GroupBusiness import GroupBusiness


class GroupCoordination:
    """Coordination service for the group namespace — thin delegation."""

    def __init__(self, business: GroupBusiness) -> None:
        self._business = business

    def get_groups(self, user):
        """List all groups. Delegates to GroupBusiness.list_groups."""
        return self._business.list_groups(user)

    def create_group(self, user, group_name: str) -> None:
        """Create a group. Delegates to GroupBusiness.create_group."""
        self._business.create_group(user, group_name)

    def get_group(self, group_id: int):
        """Get one group. Delegates to GroupBusiness.get_group."""
        return self._business.get_group(group_id)

    def delete_group(self, group_id: int) -> None:
        """Delete a group. Delegates to GroupBusiness.delete_group."""
        self._business.delete_group(group_id)
