from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from projects.models import Project

from .models import Milestone
from .serializers import MilestoneSerializer


class ProjectMilestoneListCreateView(APIView):

    permission_classes = [IsAuthenticated]

    def get_project(self, project_id):

        return get_object_or_404(
            Project.objects.select_related("client"),
            id=project_id
        )

    # -------------------------------------------------
    # GET MILESTONES
    # -------------------------------------------------

    def get(self, request, project_id):

        project = self.get_project(project_id)

        # Only project participants can view milestones.
        if not self.user_has_access(
            request.user,
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
            .filter(project=project)
            .order_by("due_date", "created_at")
        )

        serializer = MilestoneSerializer(
            milestones,
            many=True
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    # -------------------------------------------------
    # CREATE MILESTONE
    # -------------------------------------------------

    def post(self, request, project_id):

        project = self.get_project(project_id)

        # ONLY CLIENT / PROJECT OWNER
        if request.user.id != project.client_id:

            return Response(
                {
                    "detail": (
                        "Only the project owner can "
                        "create milestones."
                    )
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # Project must be in progress.
        if project.status != Project.Status.IN_PROGRESS:

            return Response(
                {
                    "detail": (
                        "Milestones can only be created "
                        "for projects that are in progress."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = MilestoneSerializer(
            data=request.data
        )

        if serializer.is_valid():

            milestone = serializer.save(
                project=project
            )

            return Response(
                MilestoneSerializer(
                    milestone
                ).data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    # -------------------------------------------------
    # ACCESS CHECK
    # -------------------------------------------------

    @staticmethod
    def user_has_access(user, project):

        if user.id == project.client_id:
            return True

        # Freelancer assigned through accepted proposal
        accepted_proposal = (
            project.proposals
            .filter(
                freelancer=user,
                status="ACCEPTED"
            )
            .exists()
        )

        return accepted_proposal


class MilestoneProgressView(APIView):

    permission_classes = [IsAuthenticated]

    # -------------------------------------------------
    # FREELANCER UPDATES PROGRESS
    # -------------------------------------------------

    def patch(self, request, milestone_id):

        milestone = get_object_or_404(
            Milestone.objects.select_related(
                "project",
                "project__client"
            ),
            id=milestone_id
        )

        project = milestone.project

        # Only the assigned freelancer can update progress.
        accepted_proposal = (
            project.proposals
            .filter(
                freelancer=request.user,
                status="ACCEPTED"
            )
            .first()
        )

        if accepted_proposal is None:

            return Response(
                {
                    "detail": (
                        "Only the assigned freelancer "
                        "can update milestone progress."
                    )
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # A completed milestone cannot be edited.
        if milestone.status == Milestone.Status.COMPLETED:

            return Response(
                {
                    "detail": (
                        "Completed milestones "
                        "cannot be modified."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        progress = request.data.get("progress")

        if progress is None:

            return Response(
                {
                    "detail": "Progress is required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            progress = int(progress)
        except (TypeError, ValueError):

            return Response(
                {
                    "detail": (
                        "Progress must be a number "
                        "between 0 and 100."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if progress < 0 or progress > 100:

            return Response(
                {
                    "detail": (
                        "Progress must be between "
                        "0 and 100."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        milestone.progress = progress

        # -------------------------------------------------
        # AUTOMATIC STATUS
        # -------------------------------------------------

        if progress == 0:

            milestone.status = Milestone.Status.PLANNED

        elif progress < 100:

            milestone.status = Milestone.Status.IN_PROGRESS

        else:

            # 100% means freelancer submits the milestone
            # for client review.
            milestone.status = Milestone.Status.SUBMITTED

        milestone.save(
            update_fields=[
                "progress",
                "status",
                "updated_at"
            ]
        )

        return Response(
            MilestoneSerializer(
                milestone
            ).data,
            status=status.HTTP_200_OK
        )


class MilestoneReviewView(APIView):

    permission_classes = [IsAuthenticated]

    # -------------------------------------------------
    # CLIENT REVIEWS MILESTONE
    # -------------------------------------------------

    def patch(self, request, milestone_id):

        milestone = get_object_or_404(
            Milestone.objects.select_related(
                "project",
                "project__client"
            ),
            id=milestone_id
        )

        project = milestone.project

        # ONLY PROJECT OWNER / CLIENT
        if project.client_id != request.user.id:

            return Response(
                {
                    "detail": (
                        "Only the project owner can "
                        "review a milestone."
                    )
                },
                status=status.HTTP_403_FORBIDDEN
            )

        decision = request.data.get(
            "decision"
        )

        if milestone.status != Milestone.Status.SUBMITTED:

            return Response(
                {
                    "detail": (
                        "Only submitted milestones "
                        "can be reviewed."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # -------------------------------------------------
        # APPROVE
        # -------------------------------------------------

        if decision == "APPROVE":

            milestone.status = (
                Milestone.Status.COMPLETED
            )

            milestone.progress = 100

            milestone.save(
                update_fields=[
                    "status",
                    "progress",
                    "updated_at"
                ]
            )

            return Response(
                MilestoneSerializer(
                    milestone
                ).data,
                status=status.HTTP_200_OK
            )

        # -------------------------------------------------
        # REQUEST CHANGES
        # -------------------------------------------------

        if decision == "REQUEST_CHANGES":

            milestone.status = (
                Milestone.Status.NEEDS_CHANGES
            )

            milestone.save(
                update_fields=[
                    "status",
                    "updated_at"
                ]
            )

            return Response(
                MilestoneSerializer(
                    milestone
                ).data,
                status=status.HTTP_200_OK
            )

        return Response(
            {
                "detail": (
                    "Decision must be APPROVE "
                    "or REQUEST_CHANGES."
                )
            },
            status=status.HTTP_400_BAD_REQUEST
        )


class MilestoneDetailView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, milestone_id):

        milestone = get_object_or_404(
            Milestone.objects.select_related(
                "project",
                "project__client"
            ),
            id=milestone_id
        )

        project = milestone.project

        if not ProjectMilestoneListCreateView.user_has_access(
            request.user,
            project
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
            milestone
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )