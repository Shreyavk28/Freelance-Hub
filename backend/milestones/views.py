from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from projects.models import Project
from proposals.models import Proposal
from workspace.models import ProjectWorkspace

from .models import Milestone
from .serializers import MilestoneSerializer


# ============================================================
# HELPERS
# ============================================================

def get_milestone(milestone_id):
    return get_object_or_404(
        Milestone.objects.select_related(
            "project",
            "project__client",
        ),
        id=milestone_id,
    )


def freelancer_is_assigned(project, user):
    """
    A freelancer can work on a project if:

    1. Their proposal was accepted
       OR
    2. They are the freelancer stored in the workspace.

    This means the logic is NOT hardcoded to Rahul, Alpa,
    or any specific freelancer.
    """

    if user.role != User.Role.FREELANCER:
        return False

    # --------------------------------------------------------
    # Accepted proposal
    # --------------------------------------------------------

    accepted_proposal = Proposal.objects.filter(
        project=project,
        freelancer=user,
        status=Proposal.Status.ACCEPTED,
    ).exists()

    if accepted_proposal:
        return True

    # --------------------------------------------------------
    # Workspace freelancer
    # --------------------------------------------------------

    workspace_freelancer = ProjectWorkspace.objects.filter(
        project=project,
        freelancer=user,
    ).exists()

    return workspace_freelancer


def user_can_access_project(request, project):
    """
    CLIENT:
        Must own the project.

    FREELANCER:
        Must be assigned to the project.
    """

    # Project client
    if project.client_id == request.user.id:
        return True

    # Assigned freelancer
    return freelancer_is_assigned(
        project,
        request.user
    )


def sync_project_completion(project):
    """
    Project becomes COMPLETED only when:

    - at least one milestone exists
    - every milestone is COMPLETED
    - every milestone has 100% progress

    If a completed project becomes incomplete again,
    move it back to IN_PROGRESS.
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
    # ALL MILESTONES COMPLETED
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
    # PROJECT WAS COMPLETED BUT IS NO LONGER COMPLETE
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

    permission_classes = [
        IsAuthenticated
    ]

    # ========================================================
    # GET
    # ========================================================

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

    # ========================================================
    # POST
    # CLIENT CREATES MILESTONE
    # ========================================================

    def post(
        self,
        request,
        project_id
    ):

        project = get_object_or_404(
            Project,
            id=project_id
        )

        # Only project client
        if project.client_id != request.user.id:

            return Response(
                {
                    "detail": (
                        "Only the project client "
                        "can create milestones."
                    )
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # Project must be in progress
        if project.status != Project.Status.IN_PROGRESS:

            return Response(
                {
                    "detail": (
                        "Milestones can only be "
                        "created for projects that "
                        "are in progress."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        data = request.data.copy()

        data["project"] = project.id
        data["status"] = Milestone.Status.PLANNED
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

    permission_classes = [
        IsAuthenticated
    ]

    # ========================================================
    # GET
    # ========================================================

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

    # ========================================================
    # PATCH
    # CLIENT CAN EDIT DETAILS
    # ========================================================

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
        # CLIENT
        # ----------------------------------------------------

        if project.client_id == request.user.id:

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
                            "Progress and status must "
                            "be changed through the "
                            "milestone workflow."
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

        # ----------------------------------------------------
        # FREELANCER
        # ----------------------------------------------------

        if not freelancer_is_assigned(
            project,
            request.user
        ):
            return Response(
                {
                    "detail": (
                        "You are not an assigned "
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

    # ========================================================
    # DELETE
    # CLIENT ONLY
    # ========================================================

    def delete(
        self,
        request,
        milestone_id
    ):

        milestone = get_milestone(
            milestone_id
        )

        project = milestone.project

        if project.client_id != request.user.id:

            return Response(
                {
                    "detail": (
                        "Only the project client "
                        "can delete milestones."
                    )
                },
                status=status.HTTP_403_FORBIDDEN
            )

        if milestone.status == Milestone.Status.COMPLETED:

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
                        "Only a freelancer can "
                        "update milestone progress."
                    )
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # ----------------------------------------------------
        # ANY ASSIGNED FREELANCER
        # ----------------------------------------------------

        if not freelancer_is_assigned(
            project,
            request.user
        ):
            return Response(
                {
                    "detail": (
                        "You are not an assigned "
                        "freelancer for this project."
                    )
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # ----------------------------------------------------
        # COMPLETED
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

        # ----------------------------------------------------
        # CANCELLED
        # ----------------------------------------------------

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
        # VALIDATE
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
        # UPDATE
        # ----------------------------------------------------

        milestone.progress = progress

        # ----------------------------------------------------
        # AUTOMATIC STATUS
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

            # IMPORTANT:
            # 100% does NOT mean completed.
            #
            # It means the freelancer has submitted
            # the milestone for client review.

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

        if project.client_id != request.user.id:

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
        # ACTION
        # ----------------------------------------------------

        action = request.data.get(
            "action"
        )

        if action not in {
            "approve",
            "changes",
            "cancel",
        }:

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
        # SUBMITTED -> COMPLETED
        # ====================================================

        if action == "approve":

            if milestone.status != Milestone.Status.SUBMITTED:

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
            project.refresh_from_db()

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

                    "project_status":
                        project.status,
                },
                status=status.HTTP_200_OK
            )

        # ====================================================
        # REQUEST CHANGES
        # SUBMITTED -> NEEDS_CHANGES
        # ====================================================

        if action == "changes":

            if milestone.status != Milestone.Status.SUBMITTED:

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

            # 100% was submitted.
            # Move it back below 100 so freelancer
            # can continue working.
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
            project.refresh_from_db()

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

                    "project_status":
                        project.status,
                },
                status=status.HTTP_200_OK
            )

        # ====================================================
        # CANCEL
        # ====================================================

        if action == "cancel":

            if milestone.status == Milestone.Status.COMPLETED:

                return Response(
                    {
                        "detail": (
                            "Completed milestones "
                            "cannot be cancelled."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            if milestone.status == Milestone.Status.CANCELLED:

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
            project.refresh_from_db()

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

                    "project_status":
                        project.status,
                },
                status=status.HTTP_200_OK
            )

        return Response(
            {
                "detail": "Invalid review action."
            },
            status=status.HTTP_400_BAD_REQUEST
        )