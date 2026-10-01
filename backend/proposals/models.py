from django.conf import settings
from django.db import models

from projects.models import Project


class Proposal(models.Model):

    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending"
        ACCEPTED = "ACCEPTED", "Accepted"
        REJECTED = "REJECTED", "Rejected"
        WITHDRAWN = "WITHDRAWN", "Withdrawn"

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="proposals"
    )

    freelancer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="proposals"
    )

    cover_letter = models.TextField()

    proposed_budget = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    estimated_duration = models.PositiveIntegerField(
        help_text="Estimated duration in days"
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.Status.PENDING
        if False else Status.PENDING
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["project", "freelancer"],
                name="unique_project_freelancer_proposal"
            )
        ]

    def __str__(self):
        return (
            f"{self.freelancer.username} - "
            f"{self.project.title}"
        )