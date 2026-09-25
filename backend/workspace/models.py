from django.conf import settings
from django.db import models


class ProjectWorkspace(models.Model):

    project = models.OneToOneField(
        "projects.Project",
        on_delete=models.CASCADE,
        related_name="workspace"
    )

    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="client_workspaces"
    )

    freelancer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="freelancer_workspaces"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return (
            f"Workspace - {self.project.title}"
        )