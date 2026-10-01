from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from workspace.models import ProjectWorkspace

from .models import Project
from .serializers import ProjectSerializer

# Milestone now belongs to the milestones app
from milestones.models import Milestone
from milestones.serializers import MilestoneSerializer


# =========================================================
# PROJECT LIST + CREATE
# =========================================================

class ProjectListCreateView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        projects = (
            Project.objects
            .filter(
                status=Project.Status.OPEN
            )
            .prefetch_related(
                "required_skills"
            )
            .select_related(
                "client"
            )
        )

        # Freelancers should not see their own
        # projects as projects they can apply to.
        if request.user.role == "FREELANCER":

            projects = projects.exclude(
                client=request.user
            )

        # Optional skill filter
        skill_id = request.query_params.get(
            "skill"
        )

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

        # Both clients and freelancers can create
        # projects according to the current project logic.
        if request.user.role not in [
            "CLIENT",
            "FREELANCER"
        ]:

            return Response(
                {
                    "detail": (
                        "Only clients and freelancers "
                        "can create projects."
                    )
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


# =========================================================
# MY PROJECTS
# =========================================================

class MyProjectsView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        if request.user.role not in [
            "CLIENT",
            "FREELANCER"
        ]:

            return Response(
                {
                    "detail": (
                        "Only clients and freelancers "
                        "can access this resource."
                    )
                },
                status=status.HTTP_403_FORBIDDEN
            )

        projects = (
            Project.objects
            .filter(
                client=request.user
            )
            .prefetch_related(
                "required_skills"
            )
            .select_related(
                "client"
            )
            .order_by(
                "-created_at"
            )
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


# =========================================================
# PROJECT DETAIL
# =========================================================

class ProjectDetailView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, project_id):

        project = get_object_or_404(
            Project.objects
            .select_related(
                "client"
            )
            .prefetch_related(
                "required_skills"
            ),
            id=project_id
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

        project = get_object_or_404(
            Project,
            id=project_id,
            client=request.user
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

        project = get_object_or_404(
            Project,
            id=project_id,
            client=request.user
        )

        project.delete()

        return Response(
            {
                "message": (
                    "Project deleted successfully."
                )
            },
            status=status.HTTP_200_OK
        )


# =========================================================
# MILESTONE LIST + CREATE
# =========================================================

class ProjectMilestoneListCreateView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, project_id):

        project = get_object_or_404(
            Project,
            id=project_id
        )

        # =================================================
        # PROJECT OWNER
        # =================================================

        is_project_owner = (
            project.client_id == request.user.id
        )

        # =================================================
        # FREELANCER THROUGH ACCEPTED PROPOSAL
        # =================================================

        is_accepted_freelancer = (
            project.proposals.filter(
                freelancer=request.user,
                status="ACCEPTED"
            ).exists()
        )

        # =================================================
        # FREELANCER ASSIGNED THROUGH WORKSPACE
        # =================================================

        is_workspace_freelancer = (
            ProjectWorkspace.objects.filter(
                project=project,
                freelancer=request.user
            ).exists()
        )

        # =================================================
        # ACCESS CHECK
        # =================================================

        if not (
            is_project_owner
            or is_accepted_freelancer
            or is_workspace_freelancer
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
            many=True
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    def post(self, request, project_id):

        project = get_object_or_404(
            Project,
            id=project_id
        )

        # =================================================
        # ONLY PROJECT OWNER CAN CREATE MILESTONES
        # =================================================

        if project.client_id != request.user.id:

            return Response(
                {
                    "detail": (
                        "Only the project owner "
                        "can create milestones."
                    )
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # =================================================
        # PROJECT MUST BE IN PROGRESS
        # =================================================

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

        data = request.data.copy()

        # Project is determined from URL,
        # so the frontend does not need to send it.
        data["project"] = project.id

        serializer = MilestoneSerializer(
            data=data
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


# =========================================================
# MILESTONE DETAIL
# =========================================================


def sync_project_completion(project):
    """
    Keep the project status in sync with its milestones.

    A project is completed only when it has at least one milestone
    and every milestone has BOTH status=COMPLETED and progress=100.
    """
    milestones = Milestone.objects.filter(project=project)
    total_milestones = milestones.count()

    all_milestones_completed = (
        total_milestones > 0
        and milestones.filter(
            status=Milestone.Status.COMPLETED,
            progress=100,
        ).count() == total_milestones
    )

    if all_milestones_completed:
        if project.status != Project.Status.COMPLETED:
            project.status = Project.Status.COMPLETED
            project.save(update_fields=["status", "updated_at"])
    elif project.status == Project.Status.COMPLETED:
        # If a freelancer moves a milestone back to an incomplete state,
        # the project must no longer remain marked as completed.
        project.status = Project.Status.IN_PROGRESS
        project.save(update_fields=["status", "updated_at"])

class MilestoneDetailView(APIView):

    permission_classes = [IsAuthenticated]

    def get_object(
        self,
        project_id,
        milestone_id
    ):

        return get_object_or_404(
            Milestone.objects.select_related(
                "project",
                "project__client"
            ),
            id=milestone_id,
            project_id=project_id
        )

    def check_access(
        self,
        request,
        milestone
    ):

        project = milestone.project

        # =================================================
        # PROJECT OWNER
        # =================================================

        if project.client_id == request.user.id:
            return True

        # =================================================
        # ACCEPTED FREELANCER
        # =================================================

        is_accepted_freelancer = (
            project.proposals.filter(
                freelancer=request.user,
                status="ACCEPTED"
            ).exists()
        )

        if is_accepted_freelancer:
            return True

        # =================================================
        # FREELANCER ASSIGNED THROUGH WORKSPACE
        # =================================================

        is_workspace_freelancer = (
            ProjectWorkspace.objects.filter(
                project=project,
                freelancer=request.user
            ).exists()
        )

        if is_workspace_freelancer:
            return True

        return False

    def get(
        self,
        request,
        project_id,
        milestone_id
    ):

        milestone = self.get_object(
            project_id,
            milestone_id
        )

        if not self.check_access(
            request,
            milestone
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

    def patch(
        self,
        request,
        project_id,
        milestone_id
    ):

        milestone = self.get_object(
            project_id,
            milestone_id
        )

        project = milestone.project

        # =================================================
        # CLIENT / PROJECT OWNER
        # =================================================

        if project.client_id == request.user.id:

            # Client can update milestone details.
            # Client CANNOT update progress.

            allowed_data = request.data.copy()

            if "progress" in allowed_data:

                return Response(
                    {
                        "detail": (
                            "Only the assigned freelancer "
                            "can update milestone progress."
                        )
                    },
                    status=status.HTTP_403_FORBIDDEN
                )

            # Client is also not allowed to update
            # progress through any other field.
            serializer = MilestoneSerializer(
                milestone,
                data=allowed_data,
                partial=True
            )

        # =================================================
        # FREELANCER
        # =================================================

        else:

            # -------------------------------------------------
            # Check accepted proposal
            # -------------------------------------------------

            accepted = (
                project.proposals.filter(
                    freelancer=request.user,
                    status="ACCEPTED"
                ).exists()
            )

            # -------------------------------------------------
            # Check workspace assignment
            # -------------------------------------------------

            assigned_through_workspace = (
                ProjectWorkspace.objects.filter(
                    project=project,
                    freelancer=request.user
                ).exists()
            )

            # -------------------------------------------------
            # Freelancer must be the assigned freelancer
            # -------------------------------------------------

            if not (
                accepted
                or assigned_through_workspace
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

            # -------------------------------------------------
            # Freelancer can update ONLY progress and status
            # -------------------------------------------------

            allowed_data = {}

            if "progress" in request.data:

                allowed_data["progress"] = (
                    request.data["progress"]
                )

            if "status" in request.data:

                allowed_data["status"] = (
                    request.data["status"]
                )

            if not allowed_data:

                return Response(
                    {
                        "detail": (
                            "Freelancers can update "
                            "progress and status only."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            serializer = MilestoneSerializer(
                milestone,
                data=allowed_data,
                partial=True
            )

        # =================================================
        # SAVE
        # =================================================

        if serializer.is_valid():

            updated_milestone = serializer.save()

            # Milestone completion controls project completion.
            # The freelancer is responsible for milestone progress/status.
            sync_project_completion(project)

            return Response(
                MilestoneSerializer(
                    updated_milestone
                ).data,
                status=status.HTTP_200_OK
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    def delete(
        self,
        request,
        project_id,
        milestone_id
    ):

        milestone = self.get_object(
            project_id,
            milestone_id
        )

        # =================================================
        # ONLY PROJECT OWNER CAN DELETE
        # =================================================

        if milestone.project.client_id != request.user.id:

            return Response(
                {
                    "detail": (
                        "Only the project owner "
                        "can delete milestones."
                    )
                },
                status=status.HTTP_403_FORBIDDEN
            )

        milestone.delete()

        return Response(
            {
                "message": (
                    "Milestone deleted successfully."
                )
            },
            status=status.HTTP_200_OK
        )