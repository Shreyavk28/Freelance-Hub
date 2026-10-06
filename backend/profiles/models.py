from django.conf import settings
from django.db import models


# =========================================================
# CLIENT PROFILE
# =========================================================

class ClientProfile(models.Model):

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="client_profile"
    )

    bio = models.TextField(
        blank=True
    )

    company_name = models.CharField(
        max_length=150,
        blank=True
    )

    location = models.CharField(
        max_length=150,
        blank=True
    )

    profile_picture = models.ImageField(
        upload_to="client_profiles/",
        blank=True,
        null=True
    )

    def __str__(self):
        return f"{self.user.username} - Client Profile"


# =========================================================
# FREELANCER PROFILE
# =========================================================

class FreelancerProfile(models.Model):

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="freelancer_profile"
    )

    bio = models.TextField(
        blank=True
    )

    headline = models.CharField(
        max_length=200,
        blank=True
    )

    location = models.CharField(
        max_length=150,
        blank=True
    )

    experience_years = models.PositiveIntegerField(
        default=0
    )

    hourly_rate = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    profile_picture = models.ImageField(
        upload_to="freelancer_profiles/",
        blank=True,
        null=True
    )

    def __str__(self):
        return f"{self.user.username} - Freelancer Profile"


# =========================================================
# SAVED FREELANCER
# =========================================================

class SavedFreelancer(models.Model):

    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="saved_freelancers"
    )

    freelancer = models.ForeignKey(
        FreelancerProfile,
        on_delete=models.CASCADE,
        related_name="saved_by_clients"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:

        constraints = [
            models.UniqueConstraint(
                fields=["client", "freelancer"],
                name="unique_saved_freelancer"
            )
        ]

        ordering = ["-created_at"]

    def __str__(self):

        return (
            f"{self.client.username} saved "
            f"{self.freelancer.user.username}"
        )