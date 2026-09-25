from rest_framework import serializers

from accounts.models import User
from skills.models import Skill

from .models import Project


class ProjectSerializer(serializers.ModelSerializer):

    client_username = serializers.CharField(
        source="client.username",
        read_only=True
    )

    required_skill_names = serializers.ListField(
        child=serializers.CharField(
            max_length=100,
            allow_blank=False
        ),
        required=False
    )

    skill_match_percentage = serializers.SerializerMethodField()

    class Meta:
        model = Project

        fields = [
            "id",
            "client_username",
            "title",
            "description",
            "budget_type",
            "budget_amount",
            "priority",
            "deadline",
            "status",
            "required_skills",
            "required_skill_names",
            "skill_match_percentage",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "client_username",
            "status",
            "required_skills",
            "skill_match_percentage",
            "created_at",
            "updated_at",
        ]

    def _get_or_create_skills(self, skill_names):

        skills = []

        for name in skill_names:

            cleaned_name = name.strip()

            if not cleaned_name:
                continue

            skill = Skill.objects.filter(
                name__iexact=cleaned_name
            ).first()

            if skill is None:
                skill = Skill.objects.create(
                    name=cleaned_name
                )

            skills.append(skill)

        return skills

    def create(self, validated_data):

        skill_names = validated_data.pop(
            "required_skill_names",
            []
        )

        project = Project.objects.create(
            **validated_data
        )

        skills = self._get_or_create_skills(
            skill_names
        )

        project.required_skills.set(skills)

        return project

    def update(self, instance, validated_data):

        skill_names = validated_data.pop(
            "required_skill_names",
            None
        )

        instance = super().update(
            instance,
            validated_data
        )

        if skill_names is not None:

            skills = self._get_or_create_skills(
                skill_names
            )

            instance.required_skills.set(skills)

        return instance

    def to_representation(self, instance):

        data = super().to_representation(instance)

        data["required_skill_names"] = list(
            instance.required_skills.values_list(
                "name",
                flat=True
            )
        )

        return data

    def get_skill_match_percentage(self, obj):

        request = self.context.get("request")

        if request is None:
            return 0

        if not request.user.is_authenticated:
            return 0

        if request.user.role != User.Role.FREELANCER:
            return 0

        required_skill_ids = set(
            obj.required_skills.values_list(
                "id",
                flat=True
            )
        )

        if not required_skill_ids:
            return 0

        freelancer_skill_ids = set(
            request.user.freelancer_skills.values_list(
                "skill_id",
                flat=True
            )
        )

        matched_skills = (
            required_skill_ids
            &
            freelancer_skill_ids
        )

        match_percentage = (
            len(matched_skills)
            / len(required_skill_ids)
        ) * 100

        return round(
            match_percentage,
            2
        )