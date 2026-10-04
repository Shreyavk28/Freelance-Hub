from django.urls import path

from .views import (
    ProjectMilestoneListCreateView,
    MilestoneProgressView,
    MilestoneReviewView,
    MilestoneDetailView,
)


urlpatterns = [

    # =====================================================
    # PROJECT MILESTONES
    # =====================================================

    path(
        "project/<int:project_id>/",
        ProjectMilestoneListCreateView.as_view(),
        name="project-milestones",
    ),

    # =====================================================
    # MILESTONE DETAIL
    # =====================================================

    path(
        "<int:milestone_id>/",
        MilestoneDetailView.as_view(),
        name="milestone-detail",
    ),

    # =====================================================
    # FREELANCER PROGRESS
    # =====================================================

    path(
        "<int:milestone_id>/progress/",
        MilestoneProgressView.as_view(),
        name="milestone-progress",
    ),

    # =====================================================
    # CLIENT REVIEW
    # =====================================================

    path(
        "<int:milestone_id>/review/",
        MilestoneReviewView.as_view(),
        name="milestone-review",
    ),
]