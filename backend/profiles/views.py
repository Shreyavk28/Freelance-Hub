from django.db.models import Q

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .models import (
    ClientProfile,
    FreelancerProfile,
    SavedFreelancer,
)

from .serializers import (
    ClientProfileSerializer,
    FreelancerProfileSerializer,
    SavedFreelancerSerializer,
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
                    "detail":
                        "Only clients can access client profiles."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        profile, created = ClientProfile.objects.get_or_create(
            user=request.user
        )

        serializer = ClientProfileSerializer(
            profile
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    def put(self, request):

        if request.user.role != "CLIENT":

            return Response(
                {
                    "detail":
                        "Only clients can update client profiles."
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
                    "detail":
                        "Only freelancers can access their profile."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        profile, created = FreelancerProfile.objects.get_or_create(
            user=request.user
        )

        serializer = FreelancerProfileSerializer(
            profile,
            context={"request": request}
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

    def put(self, request):

        if request.user.role != "FREELANCER":

            return Response(
                {
                    "detail":
                        "Only freelancers can update their profile."
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
                    "detail":
                        "Only freelancers can delete their profile photo."
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
                "detail":
                    "Profile photo removed successfully."
            },
            status=status.HTTP_200_OK
        )


# =========================================================
# FIND FREELANCERS
# =========================================================

class FreelancerListView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        if request.user.role != "CLIENT":

            return Response(
                {
                    "detail":
                        "Only clients can browse freelancers."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        freelancers = (
            FreelancerProfile.objects
            .select_related("user")
            .prefetch_related(
                "user__freelancer_skills__skill"
            )
            .all()
        )

        # -----------------------------------------------------
        # SEARCH
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
        # FILTER BY SKILL
        # -----------------------------------------------------

        skill_id = request.GET.get("skill")

        if skill_id:

            try:

                skill_id = int(skill_id)

            except (ValueError, TypeError):

                return Response(
                    {
                        "detail":
                            "Invalid skill ID."
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            freelancers = freelancers.filter(
                user__freelancer_skills__skill_id=skill_id
            ).distinct()

        # -----------------------------------------------------
        # SERIALIZE
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

    def get(
        self,
        request,
        freelancer_id
    ):

        if request.user.role != "CLIENT":

            return Response(
                {
                    "detail":
                        "Only clients can view freelancer profiles."
                },
                status=status.HTTP_403_FORBIDDEN
            )

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
                    "detail":
                        "Freelancer profile not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

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


# =========================================================
# SAVED FREELANCERS
# =========================================================

class SavedFreelancerListView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        if request.user.role != "CLIENT":

            return Response(
                {
                    "detail":
                        "Only clients can access saved freelancers."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        saved = (
            SavedFreelancer.objects
            .filter(
                client=request.user
            )
            .select_related(
                "freelancer",
                "freelancer__user"
            )
            .prefetch_related(
                "freelancer__user__freelancer_skills__skill"
            )
        )

        serializer = SavedFreelancerSerializer(
            saved,
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
# SAVE / REMOVE FREELANCER
# =========================================================

class SavedFreelancerView(APIView):

    permission_classes = [IsAuthenticated]

    def post(
        self,
        request,
        freelancer_id
    ):

        if request.user.role != "CLIENT":

            return Response(
                {
                    "detail":
                        "Only clients can save freelancers."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        try:

            freelancer = FreelancerProfile.objects.get(
                id=freelancer_id
            )

        except FreelancerProfile.DoesNotExist:

            return Response(
                {
                    "detail":
                        "Freelancer profile not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        saved, created = SavedFreelancer.objects.get_or_create(
            client=request.user,
            freelancer=freelancer
        )

        if not created:

            return Response(
                {
                    "detail":
                        "Freelancer is already saved.",
                    "is_saved": True
                },
                status=status.HTTP_200_OK
            )

        return Response(
            {
                "detail":
                    "Freelancer saved successfully.",
                "is_saved": True,
                "saved_id": saved.id
            },
            status=status.HTTP_201_CREATED
        )

    def delete(
        self,
        request,
        freelancer_id
    ):

        if request.user.role != "CLIENT":

            return Response(
                {
                    "detail":
                        "Only clients can remove saved freelancers."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        deleted_count, _ = SavedFreelancer.objects.filter(
            client=request.user,
            freelancer_id=freelancer_id
        ).delete()

        if deleted_count == 0:

            return Response(
                {
                    "detail":
                        "Freelancer was not saved.",
                    "is_saved": False
                },
                status=status.HTTP_404_NOT_FOUND
            )

        return Response(
            {
                "detail":
                    "Freelancer removed from saved list.",
                "is_saved": False
            },
            status=status.HTTP_200_OK
        )