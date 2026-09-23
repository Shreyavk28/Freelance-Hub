from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Project
from .serializers import ProjectSerializer


class ProjectListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Get open projects.

        Both clients and freelancers can browse open projects.
        A freelancer's own projects are excluded from their browse list.
        """

        projects = (
            Project.objects
            .filter(status=Project.Status.OPEN)
            .prefetch_related("required_skills")
            .select_related("client")
        )

        # A freelancer should not see their own project as a project
        # they can apply to.
        if request.user.role == "FREELANCER":
            projects = projects.exclude(
                client=request.user
            )

        # Optional skill filter
        skill_id = request.query_params.get("skill")

        if skill_id:
            projects = projects.filter(
                required_skills__id=skill_id
            )

        serializer = ProjectSerializer(
            projects,
            many=True,
            context={
                "request": request
            }
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    def post(self, request):
        """
        Both CLIENT and FREELANCER can create projects.

        CLIENT:
            Can create a project and hire a freelancer.

        FREELANCER:
            Can create a project when they need help from
            another freelancer.
        """

        if request.user.role not in [
            "CLIENT",
            "FREELANCER"
        ]:
            return Response(
                {
                    "detail": "Only clients and freelancers can create projects."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = ProjectSerializer(
            data=request.data
        )

        if serializer.is_valid():

            project = serializer.save(
                client=request.user
            )

            response_serializer = ProjectSerializer(
                project,
                context={
                    "request": request
                }
            )

            return Response(
                response_serializer.data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class MyProjectsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Return projects owned by the logged-in user.

        Both CLIENT and FREELANCER can have their own projects.
        """

        if request.user.role not in [
            "CLIENT",
            "FREELANCER"
        ]:
            return Response(
                {
                    "detail": "Only clients and freelancers can access this resource."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        projects = (
            Project.objects
            .filter(client=request.user)
            .prefetch_related("required_skills")
            .select_related("client")
            .order_by("-created_at")
        )

        serializer = ProjectSerializer(
            projects,
            many=True,
            context={
                "request": request
            }
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )


class ProjectDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, project_id):
        """
        Any authenticated user can view a project.
        """

        try:
            project = (
                Project.objects
                .select_related("client")
                .prefetch_related("required_skills")
                .get(id=project_id)
            )

        except Project.DoesNotExist:
            return Response(
                {
                    "detail": "Project not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = ProjectSerializer(
            project,
            context={
                "request": request
            }
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    def put(self, request, project_id):
        """
        Only the project owner can update the project.

        The owner can be either a CLIENT or a FREELANCER.
        """

        try:
            project = Project.objects.get(
                id=project_id,
                client=request.user
            )

        except Project.DoesNotExist:
            return Response(
                {
                    "detail": "Project not found or you are not the owner."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = ProjectSerializer(
            project,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            serializer.save()

            response_serializer = ProjectSerializer(
                project,
                context={
                    "request": request
                }
            )

            return Response(
                response_serializer.data,
                status=status.HTTP_200_OK
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    def delete(self, request, project_id):
        """
        Only the project owner can delete the project.
        """

        try:
            project = Project.objects.get(
                id=project_id,
                client=request.user
            )

        except Project.DoesNotExist:
            return Response(
                {
                    "detail": "Project not found or you are not the owner."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        project.delete()

        return Response(
            {
                "message": "Project deleted successfully."
            },
            status=status.HTTP_200_OK
        )