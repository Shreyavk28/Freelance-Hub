from rest_framework.permissions import BasePermission

from .models import User


class IsClient(BasePermission):
    message = "Only clients can access this resource."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == User.Role.CLIENT
        )


class IsFreelancer(BasePermission):
    message = "Only freelancers can access this resource."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == User.Role.FREELANCER
        )