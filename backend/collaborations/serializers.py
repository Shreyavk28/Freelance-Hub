from rest_framework import serializers

from .models import CollaborationInvitation


class CollaborationInvitationSerializer(
    serializers.ModelSerializer
):

    project_title = serializers.CharField(
        source="project.title",
        read_only=True
    )

    project_status = serializers.CharField(
        source="project.status",
        read_only=True
    )

    display_status = serializers.SerializerMethodField()

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
            "project_status",
            "display_status",
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
            "project_status",
            "display_status",
            "client",
            "client_username",
            "freelancer_username",
            "status",
            "created_at",
            "updated_at",
        ]

    def get_display_status(self, obj):

        # -----------------------------------------
        # INVITATION REJECTED
        # -----------------------------------------

        if obj.status == CollaborationInvitation.Status.REJECTED:
            return "REJECTED"

        # -----------------------------------------
        # INVITATION PENDING
        # -----------------------------------------

        if obj.status == CollaborationInvitation.Status.PENDING:
            return "PENDING"

        # -----------------------------------------
        # INVITATION ACCEPTED
        # -----------------------------------------

        if obj.status == CollaborationInvitation.Status.ACCEPTED:

            # Project completed
            if obj.project.status == "COMPLETED":
                return "COMPLETED"

            # Project cancelled
            if obj.project.status == "CANCELLED":
                return "CANCELLED"

            # Project still active
            return "ACCEPTED"

        # -----------------------------------------
        # FALLBACK
        # -----------------------------------------

        return obj.status