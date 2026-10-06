from django.db import transaction

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from profiles.models import FreelancerProfile
from projects.models import Project
from workspace.services import create_project_workspace

from .models import CollaborationInvitation
from .serializers import CollaborationInvitationSerializer


class SendInvitationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        # -------------------------------------------------
        # CLIENT AND FREELANCER CAN SEND INVITATIONS
        # -------------------------------------------------

        if request.user.role not in [
            User.Role.CLIENT,
            User.Role.FREELANCER
        ]:
            return Response(
                {
                    "detail": (
                        "Only clients and freelancers "
                        "can send invitations."
                    )
                },
                status=status.HTTP_403_FORBIDDEN
            )

        project_id = request.data.get("project")
        freelancer_id = request.data.get("freelancer")
        message = request.data.get("message", "").strip()

        # -------------------------------------------------
        # VALIDATE PROJECT
        # -------------------------------------------------

        if not project_id:
            return Response(
                {
                    "detail": "Project is required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # -------------------------------------------------
        # VALIDATE FREELANCER
        # -------------------------------------------------

        if not freelancer_id:
            return Response(
                {
                    "detail": "Freelancer is required."
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
        # PROJECT OWNERSHIP
        #
        # Project.client is currently used as the project
        # owner field.
        #
        # The owner can be either:
        # CLIENT or FREELANCER
        # -------------------------------------------------

        if project.client_id != request.user.id:
            return Response(
                {
                    "detail": (
                        "You can only invite freelancers "
                        "to your own projects."
                    )
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # -------------------------------------------------
        # PROJECT MUST BE OPEN
        # -------------------------------------------------

        if project.status != Project.Status.OPEN:
            return Response(
                {
                    "detail": (
                        "Invitations can only be sent "
                        "for open projects."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # -------------------------------------------------
        # GET FREELANCER PROFILE
        # -------------------------------------------------

        try:
            freelancer_profile = (
                FreelancerProfile.objects
                .select_related("user")
                .get(
                    id=freelancer_id
                )
            )

        except FreelancerProfile.DoesNotExist:
            return Response(
                {
                    "detail": "Freelancer profile not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        freelancer = freelancer_profile.user

        # -------------------------------------------------
        # MAKE SURE SELECTED USER IS A FREELANCER
        # -------------------------------------------------

        if freelancer.role != User.Role.FREELANCER:
            return Response(
                {
                    "detail": "Selected user is not a freelancer."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # -------------------------------------------------
        # PROJECT OWNER CANNOT INVITE THEMSELVES
        # -------------------------------------------------

        if freelancer.id == request.user.id:
            return Response(
                {
                    "detail": (
                        "You cannot invite yourself "
                        "to your own project."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # -------------------------------------------------
        # CHECK EXISTING INVITATION
        # -------------------------------------------------

        existing = (
            CollaborationInvitation.objects
            .filter(
                project=project,
                freelancer=freelancer
            )
            .first()
        )

        if existing:

            # -------------------------------------------------
            # ALREADY PENDING
            # -------------------------------------------------

            if existing.status == (
                CollaborationInvitation.Status.PENDING
            ):
                return Response(
                    {
                        "detail": (
                            "An invitation is already pending "
                            "for this freelancer."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            # -------------------------------------------------
            # ALREADY ACCEPTED
            # -------------------------------------------------

            if existing.status == (
                CollaborationInvitation.Status.ACCEPTED
            ):
                return Response(
                    {
                        "detail": (
                            "This freelancer has already "
                            "accepted the invitation."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            # -------------------------------------------------
            # PREVIOUSLY REJECTED
            #
            # Allow the project owner to send it again.
            # -------------------------------------------------

            existing.status = (
                CollaborationInvitation.Status.PENDING
            )

            existing.message = message

            existing.save(
                update_fields=[
                    "status",
                    "message",
                    "updated_at"
                ]
            )

            serializer = CollaborationInvitationSerializer(
                existing
            )

            return Response(
                serializer.data,
                status=status.HTTP_200_OK
            )

        # -------------------------------------------------
        # CREATE NEW INVITATION
        # -------------------------------------------------

        invitation = CollaborationInvitation.objects.create(
            project=project,
            client=request.user,
            freelancer=freelancer,
            message=message
        )

        serializer = CollaborationInvitationSerializer(
            invitation
        )

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )


class ClientInvitationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        # -------------------------------------------------
        # BOTH CLIENT AND FREELANCER CAN VIEW
        # INVITATIONS THEY HAVE SENT
        # -------------------------------------------------

        if request.user.role not in [
            User.Role.CLIENT,
            User.Role.FREELANCER
        ]:
            return Response(
                {
                    "detail": (
                        "Only clients and freelancers "
                        "can view sent invitations."
                    )
                },
                status=status.HTTP_403_FORBIDDEN
            )

        invitations = (
            CollaborationInvitation.objects
            .filter(
                client=request.user
            )
            .select_related(
                "project",
                "client",
                "freelancer"
            )
            .order_by("-created_at")
        )

        serializer = CollaborationInvitationSerializer(
            invitations,
            many=True
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )


class FreelancerInvitationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        # -------------------------------------------------
        # ONLY FREELANCERS RECEIVE INVITATIONS
        # -------------------------------------------------

        if request.user.role != User.Role.FREELANCER:
            return Response(
                {
                    "detail": (
                        "Only freelancers can view "
                        "received invitations."
                    )
                },
                status=status.HTTP_403_FORBIDDEN
            )

        invitations = (
            CollaborationInvitation.objects
            .filter(
                freelancer=request.user
            )
            .select_related(
                "project",
                "client",
                "freelancer"
            )
            .order_by("-created_at")
        )

        serializer = CollaborationInvitationSerializer(
            invitations,
            many=True
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )


class InvitationDecisionView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def patch(self, request, invitation_id):

        # -------------------------------------------------
        # ONLY FREELANCERS CAN RESPOND
        # -------------------------------------------------

        if request.user.role != User.Role.FREELANCER:
            return Response(
                {
                    "detail": (
                        "Only freelancers can respond "
                        "to invitations."
                    )
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # -------------------------------------------------
        # GET INVITATION
        # -------------------------------------------------

        try:
            invitation = (
                CollaborationInvitation.objects
                .select_related(
                    "project",
                    "client",
                    "freelancer"
                )
                .get(
                    id=invitation_id
                )
            )

        except CollaborationInvitation.DoesNotExist:
            return Response(
                {
                    "detail": "Invitation not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        # -------------------------------------------------
        # ONLY INVITED FREELANCER CAN RESPOND
        # -------------------------------------------------

        if invitation.freelancer_id != request.user.id:
            return Response(
                {
                    "detail": (
                        "You can only respond to "
                        "your own invitations."
                    )
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # -------------------------------------------------
        # INVITATION MUST STILL BE PENDING
        # -------------------------------------------------

        if invitation.status != (
            CollaborationInvitation.Status.PENDING
        ):
            return Response(
                {
                    "detail": (
                        "This invitation has already "
                        "been processed."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # -------------------------------------------------
        # GET DECISION
        # -------------------------------------------------

        decision = request.data.get("status")

        if decision not in [
            CollaborationInvitation.Status.ACCEPTED,
            CollaborationInvitation.Status.REJECTED
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

        project = invitation.project

        # =================================================
        # REJECT INVITATION
        # =================================================

        if decision == (
            CollaborationInvitation.Status.REJECTED
        ):

            invitation.status = (
                CollaborationInvitation.Status.REJECTED
            )

            invitation.save(
                update_fields=[
                    "status",
                    "updated_at"
                ]
            )

            serializer = CollaborationInvitationSerializer(
                invitation
            )

            return Response(
                serializer.data,
                status=status.HTTP_200_OK
            )

        # =================================================
        # ACCEPT INVITATION
        # =================================================

        # Project must still be open
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
        # ACCEPT INVITATION
        # -------------------------------------------------

        invitation.status = (
            CollaborationInvitation.Status.ACCEPTED
        )

        invitation.save(
            update_fields=[
                "status",
                "updated_at"
            ]
        )

        # -------------------------------------------------
        # REJECT OTHER PENDING INVITATIONS
        # -------------------------------------------------

        CollaborationInvitation.objects.filter(
            project=project,
            status=CollaborationInvitation.Status.PENDING
        ).exclude(
            id=invitation.id
        ).update(
            status=CollaborationInvitation.Status.REJECTED
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

        # =================================================
        # CREATE PROJECT WORKSPACE
        # =================================================

        workspace, workspace_created = (
            create_project_workspace(
                project=project,
                freelancer=invitation.freelancer
            )
        )

        # -------------------------------------------------
        # RESPONSE
        # -------------------------------------------------

        response_data = (
            CollaborationInvitationSerializer(
                invitation
            ).data
        )

        response_data["workspace_id"] = workspace.id
        response_data["workspace_created"] = workspace_created

        return Response(
            response_data,
            status=status.HTTP_200_OK
        )
        