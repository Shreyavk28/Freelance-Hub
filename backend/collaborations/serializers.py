from rest_framework import serializers

from .models import CollaborationInvitation


class CollaborationInvitationSerializer(
    serializers.ModelSerializer
):

    project_title = serializers.CharField(
        source="project.title",
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
        model = CollaborationInvitation

        fields = [
            "id",
            "project",
            "project_title",
            "client",
            "client_username",
            "freelancer",
            "freelancer_username",
            "message",
            "status",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "project_title",
            "client",
            "client_username",
            "freelancer_username",
            "status",
            "created_at",
            "updated_at",
        ]