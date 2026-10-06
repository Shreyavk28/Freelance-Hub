from rest_framework import serializers

from .models import (
    ClientProfile,
    FreelancerProfile,
    SavedFreelancer,
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

    username = serializers.CharField(
        source="user.username",
        read_only=True
    )

    email = serializers.EmailField(
        source="user.email",
        read_only=True
    )

    skills = serializers.SerializerMethodField()

    is_saved = serializers.SerializerMethodField()

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
            "is_saved",
        ]

        read_only_fields = [
            "id",
            "username",
            "email",
            "skills",
            "is_saved",
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

    # =====================================================
    # CHECK WHETHER CLIENT SAVED FREELANCER
    # =====================================================

    def get_is_saved(self, obj):

        request = self.context.get("request")

        if not request:
            return False

        if not request.user.is_authenticated:
            return False

        if request.user.role != "CLIENT":
            return False

        return SavedFreelancer.objects.filter(
            client=request.user,
            freelancer=obj
        ).exists()


# =========================================================
# SAVED FREELANCER SERIALIZER
# =========================================================

class SavedFreelancerSerializer(serializers.ModelSerializer):

    freelancer = FreelancerProfileSerializer(
        read_only=True
    )

    freelancer_id = serializers.IntegerField(
        source="freelancer.id",
        read_only=True
    )

    username = serializers.CharField(
        source="freelancer.user.username",
        read_only=True
    )

    class Meta:

        model = SavedFreelancer

        fields = [
            "id",
            "freelancer_id",
            "username",
            "freelancer",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "freelancer_id",
            "username",
            "freelancer",
            "created_at",
        ]