from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from .models import Skill, FreelancerSkill
from .serializers import (
    SkillSerializer,
    FreelancerSkillSerializer,
)


class SkillListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        skills = Skill.objects.all().order_by("name")

        serializer = SkillSerializer(
            skills,
            many=True
        )

        return Response(serializer.data)


class FreelancerSkillView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        if request.user.role != User.Role.FREELANCER:
            return Response(
                {
                    "detail":
                    "Only freelancers can access this resource."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        skills = (
            FreelancerSkill.objects
            .filter(freelancer=request.user)
            .select_related("skill")
            .order_by("skill__name")
        )

        serializer = FreelancerSkillSerializer(
            skills,
            many=True
        )

        return Response(serializer.data)

    def post(self, request):

        if request.user.role != User.Role.FREELANCER:
            return Response(
                {
                    "detail":
                    "Only freelancers can add skills."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = FreelancerSkillSerializer(
            data=request.data
        )

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        skill = serializer.validated_data.get("skill")

        new_skill_name = serializer.validated_data.get(
            "new_skill_name"
        )

        # If a new skill name was entered,
        # create it or reuse an existing one.
        if new_skill_name:
            skill_name = new_skill_name.strip()

            skill, created = Skill.objects.get_or_create(
                name=skill_name
            )

        if FreelancerSkill.objects.filter(
            freelancer=request.user,
            skill=skill
        ).exists():

            return Response(
                {
                    "detail":
                    "You already have this skill."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        freelancer_skill = FreelancerSkill.objects.create(
            freelancer=request.user,
            skill=skill
        )

        response_serializer = FreelancerSkillSerializer(
            freelancer_skill
        )

        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED
        )


class FreelancerSkillDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, skill_id):

        if request.user.role != User.Role.FREELANCER:
            return Response(
                {
                    "detail":
                    "Only freelancers can remove skills."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            freelancer_skill = FreelancerSkill.objects.get(
                freelancer=request.user,
                skill_id=skill_id
            )

        except FreelancerSkill.DoesNotExist:
            return Response(
                {
                    "detail":
                    "Skill not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        freelancer_skill.delete()

        return Response(
            {
                "message":
                "Skill removed successfully."
            },
            status=status.HTTP_200_OK
        )