from rest_framework import serializers

from .models import Proposal


class ProposalSerializer(serializers.ModelSerializer):

    freelancer_username = serializers.CharField(
        source="freelancer.username",
        read_only=True
    )

    project_title = serializers.CharField(
        source="project.title",
        read_only=True
    )

    project_status = serializers.CharField(
        source="project.status",
        read_only=True
    )

    display_status = serializers.SerializerMethodField()

    class Meta:
        model = Proposal

        fields = [
            "id",
            "project",
            "project_title",
            "project_status",
            "display_status",
            "freelancer",
            "freelancer_username",
            "cover_letter",
            "proposed_budget",
            "estimated_duration",
            "status",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "freelancer",
            "freelancer_username",
            "project_title",
            "project_status",
            "display_status",
            "status",
            "created_at",
            "updated_at",
        ]

    def get_display_status(self, obj):

        if obj.project.status == "COMPLETED":
            return "COMPLETED"

        if obj.project.status == "CANCELLED":
            return "CANCELLED"

        return obj.status