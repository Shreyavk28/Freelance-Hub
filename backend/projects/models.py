from django.conf import settings
from django.db import models

from skills.models import Skill


class Project(models.Model):

    class BudgetType(models.TextChoices):
        HOURLY = "HOURLY", "Hourly"
        MONTHLY = "MONTHLY", "Monthly"

    class Priority(models.TextChoices):
        LOW = "LOW", "Low"
        MEDIUM = "MEDIUM", "Medium"
        HIGH = "HIGH", "High"
        URGENT = "URGENT", "Urgent"

    class Status(models.TextChoices):
        OPEN = "OPEN", "Open"
        IN_PROGRESS = "IN_PROGRESS", "In Progress"
        COMPLETED = "COMPLETED", "Completed"
        CANCELLED = "CANCELLED", "Cancelled"

    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="projects",
    )

    title = models.CharField(
        max_length=200
    )

    description = models.TextField()

    budget_type = models.CharField(
        max_length=20,
        choices=BudgetType.choices
    )

    budget_amount = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    priority = models.CharField(
        max_length=20,
        choices=Priority.choices,
        default=Priority.MEDIUM
    )

    deadline = models.DateField()

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.OPEN
    )

    required_skills = models.ManyToManyField(
        Skill,
        related_name="projects",
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return self.title