from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from projects.models import Project

from .models import Milestone
from .serializers import MilestoneSerializer


# ============================================================
# HELPERS
# ============================================================

def get_milestone(milestone_id):
    """
    Return milestone with its project.
    """

    return get_object_or_404(
        Milestone.objects.select_related(
            "project",
            "project__client",
        ),
        id=milestone_id,
    )


def get_assigned_freelancer(project):
    """
    Return the freelancer assigned through the project workspace.
    """

    try:
        workspace = project.workspace
        return workspace.freelancer
    except Exception:
        return None


def user_can_access_project(request, project):
    """
    Project access:

    CLIENT:
        Must own the project.

    FREELANCER:
        Must be the freelancer assigned to the workspace.
    """

    # --------------------------------------------------------
    # CLIENT
    # --------------------------------------------------------

    if project.client_id == request.user.id:
        return True

    # --------------------------------------------------------
    # FREELANCER
    # --------------------------------------------------------

    freelancer = get_assigned_freelancer(project)

    if (
        freelancer is not None
        and freelancer.id == request.user.id
    ):
        return True

    return False


def sync_project_completion(project):
    """
    A project becomes COMPLETED only when:

    1. At least one milestone exists.
    2. Every milestone is COMPLETED.
    3. Every milestone has 100% progress.

    If a previously completed project gets an incomplete
    milestone, move it back to IN_PROGRESS.
    """

    milestones = Milestone.objects.filter(
        project=project
    )

    total = milestones.count()

    if total == 0:
        return

    completed = milestones.filter(
        status=Milestone.Status.COMPLETED,
        progress=100,
    ).count()

    # --------------------------------------------------------
    # ALL COMPLETED
    # --------------------------------------------------------

    if completed == total:

        if project.status != Project.Status.COMPLETED:

            project.status = (
                Project.Status.COMPLETED
            )

            project.save(
                update_fields=[
                    "status",
                    "updated_at",
                ]
            )

    # --------------------------------------------------------
    # PROJECT WAS COMPLETED BUT NOW IS NOT
    # --------------------------------------------------------

    elif project.status == Project.Status.COMPLETED:

        project.status = (
            Project.Status.IN_PROGRESS
        )

        project.save(
            update_fields=[
                "status",
                "updated_at",
            ]
        )


# ============================================================
# PROJECT MILESTONES
# ============================================================

class ProjectMilestoneListCreateView(APIView):
    """
    GET:
        /api/milestones/project/<project_id>/

    POST:
        /api/milestones/project/<project_id>/

    CLIENT:
        Can create milestones.

    CLIENT + assigned FREELANCER:
        Can view milestones.
    """

    permission_classes = [
        IsAuthenticated
    ]

    # --------------------------------------------------------
    # GET
    # --------------------------------------------------------

    def get(
        self,
        request,
        project_id
    ):

        project = get_object_or_404(
            Project,
            id=project_id
        )

        if not user_can_access_project(
            request,
            project
        ):

            return Response(
                {
                    "detail": (
                        "You do not have access "
                        "to this project's milestones."
                    )
                },
                status=status.HTTP_403_FORBIDDEN
            )

        milestones = (
            Milestone.objects
            .filter(
                project=project
            )
            .order_by(
                "due_date",
                "created_at"
            )
        )

        serializer = MilestoneSerializer(
            milestones,
            many=True,
            context={
                "request": request
            }
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    # --------------------------------------------------------
    # POST
    # --------------------------------------------------------

    def post(
        self,
        request,
        project_id
    ):

        project = get_object_or_404(
            Project,
            id=project_id
        )

        # ----------------------------------------------------
        # ONLY CLIENT
        # ----------------------------------------------------

        if request.user.role != User.Role.CLIENT:

            return Response(
                {
                    "detail": (
                        "Only the project client "
                        "can create milestones."
                    )
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # ----------------------------------------------------
        # MUST OWN PROJECT
        # ----------------------------------------------------

        if project.client_id != request.user.id:

            return Response(
                {
                    "detail": (
                        "You can only create milestones "
                        "for your own projects."
                    )
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # ----------------------------------------------------
        # PROJECT MUST BE IN PROGRESS
        # ----------------------------------------------------

        if (
            project.status
            != Project.Status.IN_PROGRESS
        ):

            return Response(
                {
                    "detail": (
                        "Milestones can only be created "
                        "for projects that are in progress."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        data = request.data.copy()

        # Project comes from URL
        data["project"] = project.id

        # Every new milestone starts here
        data["status"] = (
            Milestone.Status.PLANNED
        )

        data["progress"] = 0

        serializer = MilestoneSerializer(
            data=data,
            context={
                "request": request
            }
        )

        serializer.is_valid(
            raise_exception=True
        )

        milestone = serializer.save(
            project=project,
            status=Milestone.Status.PLANNED,
            progress=0,
        )

        return Response(
            MilestoneSerializer(
                milestone,
                context={
                    "request": request
                }
            ).data,
            status=status.HTTP_201_CREATED
        )


# ============================================================
# MILESTONE DETAIL
# ============================================================

class MilestoneDetailView(APIView):
    """
    GET:
        Any project participant.

    PATCH:
        CLIENT:
            Can update milestone details.

        FREELANCER:
            Cannot directly change status.
            Progress must use /progress/.

    DELETE:
        CLIENT only.
    """

    permission_classes = [
        IsAuthenticated
    ]

    # --------------------------------------------------------
    # GET
    # --------------------------------------------------------

    def get(
        self,
        request,
        milestone_id
    ):

        milestone = get_milestone(
            milestone_id
        )

        if not user_can_access_project(
            request,
            milestone.project
        ):

            return Response(
                {
                    "detail": (
                        "You do not have access "
                        "to this milestone."
                    )
                },
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = MilestoneSerializer(
            milestone,
            context={
                "request": request
            }
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    # --------------------------------------------------------
    # PATCH
    # --------------------------------------------------------

    def patch(
        self,
        request,
        milestone_id
    ):

        milestone = get_milestone(
            milestone_id
        )

        project = milestone.project

        # ====================================================
        # CLIENT
        # ====================================================

        if project.client_id == request.user.id:

            # Client can edit milestone details,
            # but cannot directly change progress/status.

            forbidden_fields = {
                "progress",
                "status",
            }

            submitted_fields = set(
                request.data.keys()
            )

            if submitted_fields.intersection(
                forbidden_fields
            ):

                return Response(
                    {
                        "detail": (
                            "Use the milestone review "
                            "workflow to change status "
                            "or use the freelancer progress "
                            "endpoint to update progress."
                        )
                    },
                    status=status.HTTP_403_FORBIDDEN
                )

            allowed_data = {
                key: value
                for key, value in request.data.items()
                if key in {
                    "title",
                    "description",
                    "amount",
                    "due_date",
                }
            }

            if not allowed_data:

                return Response(
                    {
                        "detail": (
                            "No editable milestone "
                            "fields were provided."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            serializer = MilestoneSerializer(
                milestone,
                data=allowed_data,
                partial=True,
                context={
                    "request": request
                }
            )

            serializer.is_valid(
                raise_exception=True
            )

            serializer.save()

            return Response(
                serializer.data,
                status=status.HTTP_200_OK
            )

        # ====================================================
        # FREELANCER
        # ====================================================

        freelancer = get_assigned_freelancer(
            project
        )

        if (
            freelancer is None
            or freelancer.id != request.user.id
        ):

            return Response(
                {
                    "detail": (
                        "You are not the assigned "
                        "freelancer for this project."
                    )
                },
                status=status.HTTP_403_FORBIDDEN
            )

        return Response(
            {
                "detail": (
                    "Freelancers can only update "
                    "milestone progress using the "
                    "progress endpoint."
                )
            },
            status=status.HTTP_403_FORBIDDEN
        )

    # --------------------------------------------------------
    # DELETE
    # --------------------------------------------------------

    def delete(
        self,
        request,
        milestone_id
    ):

        milestone = get_milestone(
            milestone_id
        )

        project = milestone.project

        # ----------------------------------------------------
        # CLIENT ONLY
        # ----------------------------------------------------

        if request.user.role != User.Role.CLIENT:

            return Response(
                {
                    "detail": (
                        "Only the project client "
                        "can delete milestones."
                    )
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # ----------------------------------------------------
        # MUST OWN PROJECT
        # ----------------------------------------------------

        if project.client_id != request.user.id:

            return Response(
                {
                    "detail": (
                        "You can only delete milestones "
                        "from your own projects."
                    )
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # ----------------------------------------------------
        # COMPLETED CANNOT BE DELETED
        # ----------------------------------------------------

        if (
            milestone.status
            == Milestone.Status.COMPLETED
        ):

            return Response(
                {
                    "detail": (
                        "Completed milestones "
                        "cannot be deleted."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        milestone.delete()

        # Make sure project status is still correct.
        sync_project_completion(
            project
        )

        return Response(
            {
                "detail": (
                    "Milestone deleted successfully."
                )
            },
            status=status.HTTP_200_OK
        )


# ============================================================
# FREELANCER PROGRESS
# ============================================================

class MilestoneProgressView(APIView):
    """
    Freelancer controls ONLY progress.

    0%
        -> PLANNED

    1-99%
        -> IN_PROGRESS

    100%
        -> SUBMITTED

    100% NEVER directly becomes COMPLETED.

    The CLIENT must review the submitted milestone.
    """

    permission_classes = [
        IsAuthenticated
    ]

    def patch(
        self,
        request,
        milestone_id
    ):

        milestone = get_milestone(
            milestone_id
        )

        project = milestone.project

        # ----------------------------------------------------
        # ONLY FREELANCER
        # ----------------------------------------------------

        if request.user.role != User.Role.FREELANCER:

            return Response(
                {
                    "detail": (
                        "Only the assigned freelancer "
                        "can update milestone progress."
                    )
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # ----------------------------------------------------
        # CHECK ASSIGNED FREELANCER
        # ----------------------------------------------------

        freelancer = get_assigned_freelancer(
            project
        )

        if (
            freelancer is None
            or freelancer.id != request.user.id
        ):

            return Response(
                {
                    "detail": (
                        "You are not the assigned "
                        "freelancer for this project."
                    )
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # ----------------------------------------------------
        # CANNOT UPDATE COMPLETED/CANCELLED
        # ----------------------------------------------------

        if milestone.status == Milestone.Status.COMPLETED:

            return Response(
                {
                    "detail": (
                        "Completed milestones "
                        "cannot be updated."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if milestone.status == Milestone.Status.CANCELLED:

            return Response(
                {
                    "detail": (
                        "Cancelled milestones "
                        "cannot be updated."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # ----------------------------------------------------
        # PROGRESS REQUIRED
        # ----------------------------------------------------

        if "progress" not in request.data:

            return Response(
                {
                    "progress": (
                        "This field is required."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # ----------------------------------------------------
        # CONVERT
        # ----------------------------------------------------

        try:

            progress = int(
                request.data["progress"]
            )

        except (
            TypeError,
            ValueError
        ):

            return Response(
                {
                    "progress": (
                        "Progress must be a number."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # ----------------------------------------------------
        # VALIDATE RANGE
        # ----------------------------------------------------

        if progress < 0 or progress > 100:

            return Response(
                {
                    "progress": (
                        "Progress must be between "
                        "0 and 100."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # ----------------------------------------------------
        # UPDATE PROGRESS
        # ----------------------------------------------------

        milestone.progress = progress

        # ----------------------------------------------------
        # STATUS AUTOMATICALLY FOLLOWS PROGRESS
        # ----------------------------------------------------

        if progress == 0:

            milestone.status = (
                Milestone.Status.PLANNED
            )

        elif progress < 100:

            milestone.status = (
                Milestone.Status.IN_PROGRESS
            )

        else:

            # 100% means freelancer submitted work.
            # Client must approve it.

            milestone.status = (
                Milestone.Status.SUBMITTED
            )

        milestone.save(
            update_fields=[
                "progress",
                "status",
                "updated_at",
            ]
        )

        serializer = MilestoneSerializer(
            milestone,
            context={
                "request": request
            }
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )


# ============================================================
# CLIENT REVIEW
# ============================================================

class MilestoneReviewView(APIView):
    """
    CLIENT reviews a milestone.

    approve:
        SUBMITTED -> COMPLETED

    changes:
        SUBMITTED -> NEEDS_CHANGES

    cancel:
        PLANNED / IN_PROGRESS / NEEDS_CHANGES / SUBMITTED
        -> CANCELLED
    """

    permission_classes = [
        IsAuthenticated
    ]

    def patch(
        self,
        request,
        milestone_id
    ):

        milestone = get_milestone(
            milestone_id
        )

        project = milestone.project

        # ----------------------------------------------------
        # ONLY CLIENT
        # ----------------------------------------------------

        if request.user.role != User.Role.CLIENT:

            return Response(
                {
                    "detail": (
                        "Only the project client "
                        "can review milestones."
                    )
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # ----------------------------------------------------
        # MUST OWN PROJECT
        # ----------------------------------------------------

        if project.client_id != request.user.id:

            return Response(
                {
                    "detail": (
                        "You can only review milestones "
                        "from your own projects."
                    )
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # ----------------------------------------------------
        # ACTION
        # ----------------------------------------------------

        action = request.data.get(
            "action"
        )

        allowed_actions = {
            "approve",
            "changes",
            "cancel",
        }

        if action not in allowed_actions:

            return Response(
                {
                    "action": (
                        "Action must be one of: "
                        "'approve', 'changes', "
                        "'cancel'."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # ====================================================
        # APPROVE
        # ====================================================

        if action == "approve":

            if (
                milestone.status
                != Milestone.Status.SUBMITTED
            ):

                return Response(
                    {
                        "detail": (
                            "Only submitted milestones "
                            "can be approved."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            milestone.status = (
                Milestone.Status.COMPLETED
            )

            milestone.progress = 100

            milestone.save(
                update_fields=[
                    "status",
                    "progress",
                    "updated_at",
                ]
            )

            sync_project_completion(
                project
            )

            milestone.refresh_from_db()

            return Response(
                {
                    "message": (
                        "Milestone approved successfully."
                    ),
                    "milestone": MilestoneSerializer(
                        milestone,
                        context={
                            "request": request
                        }
                    ).data,
                    "project_status": project.status,
                },
                status=status.HTTP_200_OK
            )

        # ====================================================
        # REQUEST CHANGES
        # ====================================================

        if action == "changes":

            if (
                milestone.status
                != Milestone.Status.SUBMITTED
            ):

                return Response(
                    {
                        "detail": (
                            "Only submitted milestones "
                            "can have changes requested."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            milestone.status = (
                Milestone.Status.NEEDS_CHANGES
            )

            # Keep progress below 100.
            if milestone.progress >= 100:
                milestone.progress = 99

            milestone.save(
                update_fields=[
                    "status",
                    "progress",
                    "updated_at",
                ]
            )

            sync_project_completion(
                project
            )

            milestone.refresh_from_db()

            return Response(
                {
                    "message": (
                        "Changes requested successfully."
                    ),
                    "milestone": MilestoneSerializer(
                        milestone,
                        context={
                            "request": request
                        }
                    ).data,
                    "project_status": project.status,
                },
                status=status.HTTP_200_OK
            )

        # ====================================================
        # CANCEL
        # ====================================================

        if action == "cancel":

            if (
                milestone.status
                == Milestone.Status.COMPLETED
            ):

                return Response(
                    {
                        "detail": (
                            "Completed milestones "
                            "cannot be cancelled."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            if (
                milestone.status
                == Milestone.Status.CANCELLED
            ):

                return Response(
                    {
                        "detail": (
                            "Milestone is already cancelled."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            milestone.status = (
                Milestone.Status.CANCELLED
            )

            milestone.save(
                update_fields=[
                    "status",
                    "updated_at",
                ]
            )

            sync_project_completion(
                project
            )

            milestone.refresh_from_db()

            return Response(
                {
                    "message": (
                        "Milestone cancelled successfully."
                    ),
                    "milestone": MilestoneSerializer(
                        milestone,
                        context={
                            "request": request
                        }
                    ).data,
                    "project_status": project.status,
                },
                status=status.HTTP_200_OK
            )

        return Response(
            {
                "detail": "Invalid review action."
            },
            status=status.HTTP_400_BAD_REQUEST
        )