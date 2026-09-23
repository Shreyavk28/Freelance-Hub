from django.shortcuts import get_object_or_404

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from accounts.models import User
from projects.models import Project

from .models import ProjectWorkspace
from .serializers import ProjectWorkspaceSerializer


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
            )

        else:
            return Response(
                {"detail": "Invalid user role."},
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

        if (
            workspace.client_id != request.user.id
            and
            workspace.freelancer_id != request.user.id
        ):
            return Response(
                {
                    "detail": "You do not have access to this workspace."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = ProjectWorkspaceSerializer(workspace)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )


class ProjectWorkspaceView(APIView):
    """
    Get the workspace belonging to a particular project.
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, project_id):

        project = get_object_or_404(
            Project,
            id=project_id
        )

        try:
            workspace = (
                ProjectWorkspace.objects
                .select_related(
                    "project",
                    "client",
                    "freelancer"
                )
                .get(project=project)
            )

        except ProjectWorkspace.DoesNotExist:

            return Response(
                {
                    "detail": "Workspace not found for this project."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        if (
            workspace.client_id != request.user.id
            and
            workspace.freelancer_id != request.user.id
        ):
            return Response(
                {
                    "detail": "You do not have access to this workspace."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = ProjectWorkspaceSerializer(workspace)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )