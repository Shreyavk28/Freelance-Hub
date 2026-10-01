from rest_framework import serializers

from .models import (
    ProjectWorkspace,
    ProjectFile
)


# =========================================================
# WORKSPACE SERIALIZER
# =========================================================

class ProjectWorkspaceSerializer(
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


# =========================================================
# PROJECT FILE SERIALIZER
# =========================================================

class ProjectFileSerializer(
    serializers.ModelSerializer
):

    uploaded_by_username = serializers.CharField(
        source="uploaded_by.username",
        read_only=True
    )

    file_url = serializers.SerializerMethodField()

    can_delete = serializers.SerializerMethodField()

    class Meta:

        model = ProjectFile

        fields = [
            "id",
            "project",
            "file",
            "file_url",
            "original_name",
            "uploaded_by",
            "uploaded_by_username",
            "uploaded_at",
            "can_delete",
        ]

        read_only_fields = [
            "id",
            "project",
            "original_name",
            "uploaded_by",
            "uploaded_by_username",
            "uploaded_at",
            "file_url",
            "can_delete",
        ]

    # =====================================================
    # FILE URL
    # =====================================================

    def get_file_url(self, obj):

        request = self.context.get("request")

        if not obj.file:
            return None

        if request:

            return request.build_absolute_uri(
                obj.file.url
            )

        return obj.file.url

    # =====================================================
    # DELETE PERMISSION
    # =====================================================

    def get_can_delete(self, obj):

        request = self.context.get("request")

        if not request:
            return False

        if not request.user.is_authenticated:
            return False

        return (
            obj.uploaded_by_id ==
            request.user.id
        )