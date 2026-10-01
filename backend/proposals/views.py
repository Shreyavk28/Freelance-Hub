from django.db import transaction

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from projects.models import Project
from workspace.services import create_project_workspace

from .models import Proposal
from .serializers import ProposalSerializer


class ProposalCreateView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        # -------------------------------------------------
        # ONLY FREELANCERS CAN SUBMIT PROPOSALS
        # -------------------------------------------------

        if request.user.role != User.Role.FREELANCER:

            return Response(
                {
                    "detail": (
                        "Only freelancers can "
                        "submit proposals."
                    )
                },
                status=status.HTTP_403_FORBIDDEN
            )

        project_id = request.data.get("project")

        if not project_id:

            return Response(
                {
                    "detail": "Project ID is required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # -------------------------------------------------
        # GET PROJECT
        # -------------------------------------------------

        try:

            project = Project.objects.get(
                id=project_id
            )

        except Project.DoesNotExist:

            return Response(
                {
                    "detail": "Project not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        # -------------------------------------------------
        # OWN PROJECT CHECK
        # -------------------------------------------------

        if project.client_id == request.user.id:

            return Response(
                {
                    "detail": (
                        "You cannot submit a proposal "
                        "to your own project."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # -------------------------------------------------
        # PROJECT MUST BE OPEN
        # -------------------------------------------------

        if project.status != Project.Status.OPEN:

            return Response(
                {
                    "detail": (
                        "Proposals can only be submitted "
                        "to open projects."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # -------------------------------------------------
        # DUPLICATE PROPOSAL CHECK
        # -------------------------------------------------

        if Proposal.objects.filter(
            project=project,
            freelancer=request.user
        ).exists():

            return Response(
                {
                    "detail": (
                        "You have already submitted "
                        "a proposal for this project."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # -------------------------------------------------
        # SERIALIZE
        # -------------------------------------------------

        serializer = ProposalSerializer(
            data=request.data
        )

        if serializer.is_valid():

            proposal = serializer.save(
                freelancer=request.user
            )

            return Response(
                ProposalSerializer(
                    proposal
                ).data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class MyProposalsView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        if request.user.role != User.Role.FREELANCER:

            return Response(
                {
                    "detail": (
                        "Only freelancers can "
                        "access this resource."
                    )
                },
                status=status.HTTP_403_FORBIDDEN
            )

        proposals = (
            Proposal.objects
            .filter(
                freelancer=request.user
            )
            .select_related(
                "project",
                "freelancer"
            )
            .order_by("-created_at")
        )

        serializer = ProposalSerializer(
            proposals,
            many=True
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )


class ProjectProposalsView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, project_id):

        try:

            project = Project.objects.get(
                id=project_id,
                client=request.user
            )

        except Project.DoesNotExist:

            return Response(
                {
                    "detail": (
                        "Project not found or "
                        "you are not the owner."
                    )
                },
                status=status.HTTP_404_NOT_FOUND
            )

        proposals = (
            Proposal.objects
            .filter(
                project=project
            )
            .select_related(
                "project",
                "freelancer"
            )
            .order_by("-created_at")
        )

        serializer = ProposalSerializer(
            proposals,
            many=True
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )


class ProposalDecisionView(APIView):

    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def patch(
        self,
        request,
        proposal_id
    ):

        # -------------------------------------------------
        # GET PROPOSAL
        # -------------------------------------------------

        try:

            proposal = (
                Proposal.objects
                .select_related(
                    "project",
                    "freelancer"
                )
                .get(
                    id=proposal_id
                )
            )

        except Proposal.DoesNotExist:

            return Response(
                {
                    "detail": "Proposal not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        project = proposal.project

        # -------------------------------------------------
        # ONLY PROJECT OWNER CAN DECIDE
        # -------------------------------------------------

        if project.client_id != request.user.id:

            return Response(
                {
                    "detail": (
                        "You do not have permission "
                        "to manage this proposal."
                    )
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # -------------------------------------------------
        # PROPOSAL MUST BE PENDING
        # -------------------------------------------------

        if proposal.status != Proposal.Status.PENDING:

            return Response(
                {
                    "detail": (
                        "This proposal has already "
                        "been processed."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        decision = request.data.get("status")

        # -------------------------------------------------
        # VALIDATE DECISION
        # -------------------------------------------------

        if decision not in [
            Proposal.Status.ACCEPTED,
            Proposal.Status.REJECTED
        ]:

            return Response(
                {
                    "detail": (
                        "Status must be ACCEPTED "
                        "or REJECTED."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # =================================================
        # REJECT PROPOSAL
        # =================================================

        if decision == Proposal.Status.REJECTED:

            proposal.status = Proposal.Status.REJECTED

            proposal.save(
                update_fields=[
                    "status",
                    "updated_at"
                ]
            )

            return Response(
                ProposalSerializer(
                    proposal
                ).data,
                status=status.HTTP_200_OK
            )

        # =================================================
        # ACCEPT PROPOSAL
        # =================================================

        # Project must still be open.

        if project.status != Project.Status.OPEN:

            return Response(
                {
                    "detail": (
                        "This project is no longer open."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # -------------------------------------------------
        # ACCEPT SELECTED PROPOSAL
        # -------------------------------------------------

        proposal.status = Proposal.Status.ACCEPTED

        proposal.save(
            update_fields=[
                "status",
                "updated_at"
            ]
        )

        # -------------------------------------------------
        # REJECT OTHER PENDING PROPOSALS
        # -------------------------------------------------

        Proposal.objects.filter(
            project=project,
            status=Proposal.Status.PENDING
        ).exclude(
            id=proposal.id
        ).update(
            status=Proposal.Status.REJECTED
        )

        # -------------------------------------------------
        # START PROJECT
        # -------------------------------------------------

        project.status = Project.Status.IN_PROGRESS

        project.save(
            update_fields=[
                "status",
                "updated_at"
            ]
        )

        # -------------------------------------------------
        # CREATE WORKSPACE
        # -------------------------------------------------

        workspace, workspace_created = (
            create_project_workspace(
                project=project,
                freelancer=proposal.freelancer
            )
        )

        # -------------------------------------------------
        # RESPONSE
        # -------------------------------------------------

        response_data = ProposalSerializer(
            proposal
        ).data

        response_data["workspace_id"] = (
            workspace.id
        )

        response_data["workspace_created"] = (
            workspace_created
        )

        return Response(
            response_data,
            status=status.HTTP_200_OK
        )