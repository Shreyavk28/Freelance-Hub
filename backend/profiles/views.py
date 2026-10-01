from django.db.models import Q

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .models import (
    ClientProfile,
    FreelancerProfile,
)

from .serializers import (
    ClientProfileSerializer,
    FreelancerProfileSerializer,
)


# =========================================================
# CLIENT PROFILE
# =========================================================

class ClientProfileView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        if request.user.role != "CLIENT":
            return Response(
                {
                    "detail": "Only clients can access client profiles."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        profile, created = ClientProfile.objects.get_or_create(
            user=request.user
        )

        serializer = ClientProfileSerializer(profile)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    def put(self, request):

        if request.user.role != "CLIENT":
            return Response(
                {
                    "detail": "Only clients can update client profiles."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        profile, created = ClientProfile.objects.get_or_create(
            user=request.user
        )

        serializer = ClientProfileSerializer(
            profile,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            serializer.save()

            return Response(
                serializer.data,
                status=status.HTTP_200_OK
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


# =========================================================
# FREELANCER PROFILE
# =========================================================

class FreelancerProfileView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        if request.user.role != "FREELANCER":
            return Response(
                {
                    "detail": "Only freelancers can access their profile."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        profile, created = FreelancerProfile.objects.get_or_create(
            user=request.user
        )

        serializer = FreelancerProfileSerializer(profile)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    def put(self, request):

        if request.user.role != "FREELANCER":
            return Response(
                {
                    "detail": "Only freelancers can update their profile."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        profile, created = FreelancerProfile.objects.get_or_create(
            user=request.user
        )

        serializer = FreelancerProfileSerializer(
            profile,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            serializer.save()

            return Response(
                serializer.data,
                status=status.HTTP_200_OK
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


# =========================================================
# DELETE FREELANCER PROFILE PHOTO
# =========================================================

class FreelancerProfilePhotoDeleteView(APIView):

    permission_classes = [IsAuthenticated]

    def delete(self, request):

        if request.user.role != "FREELANCER":
            return Response(
                {
                    "detail": "Only freelancers can delete their profile photo."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        profile, created = FreelancerProfile.objects.get_or_create(
            user=request.user
        )

        if profile.profile_picture:

            profile.profile_picture.delete(
                save=False
            )

            profile.profile_picture = None

            profile.save(
                update_fields=["profile_picture"]
            )

        return Response(
            {
                "detail": "Profile photo removed successfully."
            },
            status=status.HTTP_200_OK
        )


# =========================================================
# FIND FREELANCERS
# =========================================================

class FreelancerListView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        # -----------------------------------------------------
        # Only clients can browse freelancers
        # -----------------------------------------------------

        if request.user.role != "CLIENT":
            return Response(
                {
                    "detail": "Only clients can browse freelancers."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # -----------------------------------------------------
        # Get freelancer profiles
        # -----------------------------------------------------

        freelancers = (
            FreelancerProfile.objects
            .select_related("user")
            .prefetch_related(
                "user__freelancer_skills__skill"
            )
            .all()
        )

        # -----------------------------------------------------
        # Search
        # -----------------------------------------------------

        search = request.GET.get(
            "search",
            ""
        ).strip()

        if search:

            freelancers = freelancers.filter(

                Q(
                    user__username__icontains=search
                )

                |

                Q(
                    headline__icontains=search
                )

                |

                Q(
                    bio__icontains=search
                )

                |

                Q(
                    location__icontains=search
                )

                |

                Q(
                    user__freelancer_skills__skill__name__icontains=search
                )

            ).distinct()

        # -----------------------------------------------------
        # Filter by skill
        # -----------------------------------------------------

        skill_id = request.GET.get("skill")

        if skill_id:

            try:

                skill_id = int(skill_id)

            except (ValueError, TypeError):

                return Response(
                    {
                        "detail": "Invalid skill ID."
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            freelancers = freelancers.filter(
                user__freelancer_skills__skill_id=skill_id
            ).distinct()

        # -----------------------------------------------------
        # Serialize
        # -----------------------------------------------------

        serializer = FreelancerProfileSerializer(
            freelancers,
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
# VIEW INDIVIDUAL FREELANCER
# =========================================================

class FreelancerDetailView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, freelancer_id):

        # -----------------------------------------------------
        # Only clients can view freelancer profiles
        # -----------------------------------------------------

        if request.user.role != "CLIENT":
            return Response(
                {
                    "detail": "Only clients can view freelancer profiles."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # -----------------------------------------------------
        # IMPORTANT:
        # freelancer_id is FreelancerProfile.id
        #
        # The Find Freelancers API returns the profile ID.
        # Therefore we must search by:
        #
        #     id=freelancer_id
        #
        # NOT:
        #
        #     user_id=freelancer_id
        # -----------------------------------------------------

        try:

            freelancer = (
                FreelancerProfile.objects
                .select_related("user")
                .prefetch_related(
                    "user__freelancer_skills__skill"
                )
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

        # -----------------------------------------------------
        # Serialize
        # -----------------------------------------------------

        serializer = FreelancerProfileSerializer(
            freelancer,
            context={
                "request": request
            }
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )