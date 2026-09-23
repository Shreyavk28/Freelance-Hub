from django.conf import settings
from django.db import models


class CollaborationInvitation(models.Model):

    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        ACCEPTED = "ACCEPTED", "Accepted"
        REJECTED = "REJECTED", "Rejected"

    project = models.ForeignKey(
        "projects.Project",
        on_delete=models.CASCADE,
        related_name="collaboration_invitations"
    )

    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="sent_collaboration_invitations"
    )

    freelancer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="received_collaboration_invitations"
    )

    message = models.TextField(
        blank=True
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = ["-created_at"]

        constraints = [
            models.UniqueConstraint(
                fields=["project", "freelancer"],
                name="unique_project_freelancer_invitation"
            )
        ]

    def __str__(self):
        return (
            f"{self.project.title} - "
            f"{self.freelancer.username} - "
            f"{self.status}"
        )