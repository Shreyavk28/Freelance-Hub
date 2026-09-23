from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import IsAuthenticated

from .serializers import RegisterSerializer, LoginSerializer
from .permissions import IsClient, IsFreelancer


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