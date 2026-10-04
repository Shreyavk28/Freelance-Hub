from rest_framework import serializers

from .models import Milestone


class MilestoneSerializer(
    serializers.ModelSerializer
):

    project_title = serializers.CharField(
        source="project.title",
        read_only=True
    )

    is_project_owner = serializers.SerializerMethodField(
        read_only=True
    )

    can_update_progress = serializers.SerializerMethodField(
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
            "is_project_owner",
            "can_update_progress",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "project",
            "project_title",
            "status",
            "progress",
            "is_project_owner",
            "can_update_progress",
            "created_at",
            "updated_at",
        ]

    # ========================================================
    # PROJECT OWNER
    # ========================================================

    def get_is_project_owner(
        self,
        obj
    ):

        request = self.context.get(
            "request"
        )

        if not request:
            return False

        if not request.user.is_authenticated:
            return False

        return (
            obj.project.client_id
            == request.user.id
        )

    # ========================================================
    # CAN UPDATE PROGRESS
    # ========================================================

    def get_can_update_progress(
        self,
        obj
    ):

        request = self.context.get(
            "request"
        )

        if not request:
            return False

        if not request.user.is_authenticated:
            return False

        user = request.user

        if user.role != "FREELANCER":
            return False

        # ----------------------------------------------------
        # ACCEPTED PROPOSAL
        # ----------------------------------------------------

        accepted = obj.project.proposals.filter(
            freelancer=user,
            status="ACCEPTED",
        ).exists()

        if accepted:
            return True

        # ----------------------------------------------------
        # WORKSPACE FREELANCER
        # ----------------------------------------------------

        try:

            workspace = obj.project.workspace

            if (
                workspace.freelancer_id
                == user.id
            ):
                return True

        except Exception:
            pass

        return False