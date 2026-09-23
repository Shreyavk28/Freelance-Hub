from rest_framework import serializers

from .models import ProjectWorkspace


class ProjectWorkspaceSerializer(serializers.ModelSerializer):
    project_title = serializers.CharField(
        source="project.title",
        read_only=True
    )

    project_status = serializers.CharField(
        source="project.status",
        read_only=True
    )

    client_username = serializers.CharField(
        source="client.username",
        read_only=True
    )

    freelancer_username = serializers.CharField(
        source="freelancer.username",
        read_only=True
    )

    class Meta:
        model = ProjectWorkspace

        fields = [
            "id",
            "project",
            "project_title",
            "project_status",
            "client",
            "client_username",
            "freelancer",
            "freelancer_username",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "project_title",
            "project_status",
            "client",
            "client_username",
            "freelancer",
            "freelancer_username",
            "created_at",
            "updated_at",
        ]