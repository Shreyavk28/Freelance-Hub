from rest_framework import serializers

from .models import (
    ClientProfile,
    FreelancerProfile,
)


# =========================================================
# CLIENT PROFILE SERIALIZER
# =========================================================

class ClientProfileSerializer(serializers.ModelSerializer):

    username = serializers.CharField(
        source="user.username",
        read_only=True
    )

    email = serializers.EmailField(
        source="user.email",
        read_only=True
    )

    class Meta:
        model = ClientProfile

        fields = [
            "id",
            "username",
            "email",
            "bio",
            "company_name",
            "location",
            "profile_picture",
        ]

        read_only_fields = [
            "id",
            "username",
            "email",
        ]


# =========================================================
# FREELANCER PROFILE SERIALIZER
# =========================================================

class FreelancerProfileSerializer(serializers.ModelSerializer):

    # -----------------------------------------------------
    # User information
    # -----------------------------------------------------

    username = serializers.CharField(
        source="user.username",
        read_only=True
    )

    email = serializers.EmailField(
        source="user.email",
        read_only=True
    )

    # -----------------------------------------------------
    # Freelancer skills
    # -----------------------------------------------------

    skills = serializers.SerializerMethodField()

    # =====================================================
    # META
    # =====================================================

    class Meta:
        model = FreelancerProfile

        fields = [
            "id",
            "username",
            "email",
            "bio",
            "headline",
            "location",
            "experience_years",
            "hourly_rate",
            "profile_picture",
            "skills",
        ]

        read_only_fields = [
            "id",
            "username",
            "email",
            "skills",
        ]

    # =====================================================
    # GET SKILLS
    # =====================================================

    def get_skills(self, obj):

        skills = []

        for freelancer_skill in obj.user.freelancer_skills.all():

            skills.append(
                {
                    "id": freelancer_skill.skill.id,
                    "name": freelancer_skill.skill.name,
                }
            )

        return skills