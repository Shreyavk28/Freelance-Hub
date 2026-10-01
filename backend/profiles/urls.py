from django.urls import path

from .views import (
    ClientProfileView,
    FreelancerProfileView,
    FreelancerProfilePhotoDeleteView,
    FreelancerListView,
    FreelancerDetailView,
)


urlpatterns = [

    # =========================================================
    # CLIENT PROFILE
    # =========================================================

    path(
        "client/",
        ClientProfileView.as_view(),
        name="client-profile",
    ),


    # =========================================================
    # FREELANCER'S OWN PROFILE
    # =========================================================

    path(
        "freelancer/",
        FreelancerProfileView.as_view(),
        name="freelancer-profile",
    ),


    # =========================================================
    # DELETE FREELANCER PROFILE PHOTO
    # =========================================================

    path(
        "freelancer/photo/",
        FreelancerProfilePhotoDeleteView.as_view(),
        name="freelancer-photo-delete",
    ),


    # =========================================================
    # FIND FREELANCERS
    # =========================================================

    path(
        "freelancers/",
        FreelancerListView.as_view(),
        name="freelancer-list",
    ),


    # =========================================================
    # VIEW INDIVIDUAL FREELANCER
    # =========================================================

    path(
        "freelancers/<int:freelancer_id>/",
        FreelancerDetailView.as_view(),
        name="freelancer-detail",
    ),
]