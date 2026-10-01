from django.contrib.auth import get_user_model

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import IsAuthenticated

from .serializers import RegisterSerializer, LoginSerializer
from .permissions import IsClient, IsFreelancer

from projects.models import Project
from skills.models import Skill


class RegisterView(APIView):

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()

            return Response(
                {
                    "message": "Registration successful",
                    "user": {
                        "id": user.id,
                        "username": user.username,
                        "email": user.email,
                        "role": user.role,
                    }
                },
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class LoginView(TokenObtainPairView):
    serializer_class = LoginSerializer
    
class PlatformOverviewView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        User = get_user_model()

        total_clients = User.objects.filter(
            role=User.Role.CLIENT
        ).count()

        total_freelancers = User.objects.filter(
            role=User.Role.FREELANCER
        ).count()

        total_projects = Project.objects.count()

        open_projects = Project.objects.filter(
            status=Project.Status.OPEN
        ).count()

        completed_projects = Project.objects.filter(
            status=Project.Status.COMPLETED
        ).count()

        total_skills = Skill.objects.count()

        return Response({
            "total_clients": total_clients,
            "total_freelancers": total_freelancers,
            "total_projects": total_projects,
            "open_projects": open_projects,
            "completed_projects": completed_projects,
            "total_skills": total_skills
        })
    
    
class ClientTestView(APIView):
    permission_classes = [IsAuthenticated, IsClient]

    def get(self, request):
        return Response({
            "message": "You are accessing a client-only API.",
            "username": request.user.username,
            "role": request.user.role
        })


class FreelancerTestView(APIView):
    permission_classes = [IsAuthenticated, IsFreelancer]

    def get(self, request):
        return Response({
            "message": "You are accessing a freelancer-only API.",
            "username": request.user.username,
            "role": request.user.role
        })