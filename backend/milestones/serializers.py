from rest_framework import serializers

from .models import Milestone


class MilestoneSerializer(
    serializers.ModelSerializer
):

    project_title = serializers.CharField(
        source="project.title",
        read_only=True
    )

    class Meta:

        model = Milestone

        fields = [
            "id",
            "project",
            "project_title",
            "title",
            "description",
            "amount",
            "due_date",
            "status",
            "progress",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "project",
            "project_title",
            "status",
            "progress",
            "created_at",
            "updated_at",
        ]