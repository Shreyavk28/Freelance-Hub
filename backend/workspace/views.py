from django.shortcuts import get_object_or_404

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from accounts.models import User
from projects.models import Project
from proposals.models import Proposal
from collaborations.models import CollaborationInvitation

from .models import ProjectWorkspace
from .serializers import ProjectWorkspaceSerializer
from .services import create_project_workspace


class WorkspaceListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        if request.user.role == User.Role.CLIENT:

            workspaces = (
                ProjectWorkspace.objects
                .filter(client=request.user)
                .select_related(
                    "project",
                    "client",
                    "freelancer"
                )
                .order_by("-created_at")
            )

        elif request.user.role == User.Role.FREELANCER:

            workspaces = (
                ProjectWorkspace.objects
                .filter(freelancer=request.user)
                .select_related(
                    "project",
                    "client",
                    "freelancer"
                )
                .order_by("-created_at")
            )

        else:
            return Response(
                {
                    "detail": "Invalid user role."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = ProjectWorkspaceSerializer(
            workspaces,
            many=True
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )


class WorkspaceDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, workspace_id):

        workspace = get_object_or_404(
            ProjectWorkspace.objects.select_related(
                "project",
                "client",
                "freelancer"
            ),
            id=workspace_id
        )

        # Only project participants can access workspace
        if (
            workspace.client_id != request.user.id
            and
            workspace.freelancer_id != request.user.id
        ):
            return Response(
                {
                    "detail": (
                        "You do not have access "
                        "to this workspace."
                    )
                },
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = ProjectWorkspaceSerializer(
            workspace
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )


class ProjectWorkspaceView(APIView):
    """
    Get the workspace belonging to a project.

    If the project is already IN_PROGRESS but the workspace
    is missing, recover/create the workspace using either:

    1. An accepted proposal, or
    2. An accepted collaboration invitation.

    This also repairs older projects where the project was
    already started but the workspace was not created.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, project_id):

        # -------------------------------------------------
        # GET PROJECT
        # -------------------------------------------------

        project = get_object_or_404(
            Project.objects.select_related(
                "client"
            ),
            id=project_id
        )

        # -------------------------------------------------
        # CHECK EXISTING WORKSPACE
        # -------------------------------------------------

        try:

            workspace = (
                ProjectWorkspace.objects
                .select_related(
                    "project",
                    "client",
                    "freelancer"
                )
                .get(
                    project=project
                )
            )

        except ProjectWorkspace.DoesNotExist:

            # -------------------------------------------------
            # WORKSPACE DOES NOT EXIST
            # -------------------------------------------------

            if project.status != Project.Status.IN_PROGRESS:

                return Response(
                    {
                        "detail": (
                            "Workspace has not been created "
                            "for this project yet."
                        )
                    },
                    status=status.HTTP_404_NOT_FOUND
                )

            # -------------------------------------------------
            # FIRST: FIND ACCEPTED PROPOSAL
            # -------------------------------------------------

            accepted_proposal = (
                Proposal.objects
                .select_related(
                    "freelancer"
                )
                .filter(
                    project=project,
                    status=Proposal.Status.ACCEPTED
                )
                .order_by("-updated_at")
                .first()
            )

            freelancer = None

            if accepted_proposal is not None:
                freelancer = accepted_proposal.freelancer

            # -------------------------------------------------
            # SECOND: FIND ACCEPTED INVITATION
            #
            # This is important for projects that were started
            # through the invitation workflow.
            # -------------------------------------------------

            if freelancer is None:

                accepted_invitation = (
                    CollaborationInvitation.objects
                    .select_related(
                        "freelancer"
                    )
                    .filter(
                        project=project,
                        status=(
                            CollaborationInvitation
                            .Status
                            .ACCEPTED
                        )
                    )
                    .order_by("-updated_at")
                    .first()
                )

                if accepted_invitation is not None:
                    freelancer = (
                        accepted_invitation.freelancer
                    )

            # -------------------------------------------------
            # NO ACCEPTED PARTICIPANT FOUND
            # -------------------------------------------------

            if freelancer is None:

                return Response(
                    {
                        "detail": (
                            "Project is in progress, "
                            "but no accepted proposal or "
                            "accepted invitation was found."
                        )
                    },
                    status=status.HTTP_404_NOT_FOUND
                )

            # -------------------------------------------------
            # CREATE MISSING WORKSPACE
            # -------------------------------------------------

            workspace, workspace_created = (
                create_project_workspace(
                    project=project,
                    freelancer=freelancer
                )
            )

            # -------------------------------------------------
            # RELOAD WORKSPACE
            # -------------------------------------------------

            workspace = (
                ProjectWorkspace.objects
                .select_related(
                    "project",
                    "client",
                    "freelancer"
                )
                .get(
                    id=workspace.id
                )
            )

        # -------------------------------------------------
        # CHECK USER ACCESS
        # -------------------------------------------------

        if (
            workspace.client_id != request.user.id
            and
            workspace.freelancer_id != request.user.id
        ):
            return Response(
                {
                    "detail": (
                        "You do not have access "
                        "to this workspace."
                    )
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # -------------------------------------------------
        # SERIALIZE
        # -------------------------------------------------

        serializer = ProjectWorkspaceSerializer(
            workspace
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )