"""User coordination layer — thin routing of endpoint calls to business.

Flow
----
UserEndpoint  ->  UserCoordination  ->  UserBusiness
"""

from lost.controllers.user.UserBusiness import UserBusiness


class UserCoordination:
    """Coordination service for the user namespace — thin delegation."""

    def __init__(self, business: UserBusiness) -> None:
        self._business = business

    def get_users(self) -> dict:
        """List users. Delegates to UserBusiness.list_users."""
        return self._business.list_users()

    def get_anno_task_users(self) -> dict:
        """List users with annotation tasks. Delegates to UserBusiness.list_anno_task_users."""
        return self._business.anno_task_users()

    def get_user(self, user_id: int) -> dict:
        """Get one user. Delegates to UserBusiness.get_user."""
        return self._business.get_user_dict(user_id)

    def get_self(self, user) -> dict:
        """Get authenticated user. Delegates to UserBusiness.get_self_dict."""
        return self._business.get_self_dict(user)

    def create_user(self, req) -> dict:
        """Add user. Delegates to UserBusiness.create_user."""
        return self._business.create_user(req)

    def update_self(self, user_id: int, req) -> dict:
        """Update own profile. Delegates to UserBusiness.update_self."""
        return self._business.update_self(user_id,req)

    def delete_user(self, user, user_id: int) -> dict:
        """Soft-delete user. Delegates to UserBusiness.delete_user."""
        return self._business.delete_user(user,user_id)

    def update_user(self, user_id: int, req) -> dict:
        """Edit user. Delegates to UserBusiness.update_user."""
        return self._business.update_user(user_id, req)

    def logout(self, user, token: str) -> dict:
        """Revoke JWT and release locked annos. Delegates to UserBusiness.logout."""
        return self._business.logout(user, token)

    def refresh(self, token: str) -> dict:
        """Refresh the JWT pair. Delegates to UserBusiness.refresh."""
        return self._business.refresh(token)

    def login(self, req) -> dict:
        """Login with username and password. Delegates to UserBusiness.login."""
        return self._business.login(req.userName, req.password)

    def long_lived_user(self, user) -> dict:
        """Create a long-lived token (3650 days). Delegates to UserBusiness.long_lived_token."""
        return self._business.long_lived_token(user)
