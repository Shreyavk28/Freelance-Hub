from django.urls import path

from .views import (
    ClientProfileView,
    FreelancerProfileView,
    FreelancerProfilePhotoDeleteView,
    FreelancerListView,
    FreelancerDetailView,
    SavedFreelancerListView,
    SavedFreelancerView,
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

    # =========================================================
    # SAVED FREELANCERS
    # =========================================================

    path(
        "saved-freelancers/",
        SavedFreelancerListView.as_view(),
        name="saved-freelancers",
    ),

    # =========================================================
    # SAVE / REMOVE FREELANCER
    # =========================================================

    path(
        "saved-freelancers/<int:freelancer_id>/",
        SavedFreelancerView.as_view(),
        name="save-freelancer",
    ),
]