from django.db import models

from projects.models import Project


class Milestone(models.Model):

    class Status(models.TextChoices):

        PLANNED = (
            "PLANNED",
            "Planned"
        )

        IN_PROGRESS = (
            "IN_PROGRESS",
            "In Progress"
        )

        SUBMITTED = (
            "SUBMITTED",
            "Submitted"
        )

        NEEDS_CHANGES = (
            "NEEDS_CHANGES",
            "Needs Changes"
        )

        COMPLETED = (
            "COMPLETED",
            "Completed"
        )

        CANCELLED = (
            "CANCELLED",
            "Cancelled"
        )

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="milestones"
    )

    title = models.CharField(
        max_length=200
    )

    description = models.TextField(
        blank=True
    )

    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    due_date = models.DateField()

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PLANNED
    )

    progress = models.PositiveIntegerField(
        default=0
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):

        return (
            f"{self.project.title} - "
            f"{self.title}"
        )