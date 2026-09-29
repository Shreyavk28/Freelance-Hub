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

    # GET:
    # /api/milestones/project/8/
    #
    # POST:
    # /api/milestones/project/8/
    #
    # CLIENT creates
    # CLIENT + assigned FREELANCER views
    path(
        "project/<int:project_id>/",
        ProjectMilestoneListCreateView.as_view(),
        name="project-milestones",
    ),

    # =====================================================
    # MILESTONE DETAIL
    # =====================================================

    # GET:
    # /api/milestones/6/
    #
    # PATCH:
    # Client can update milestone details.
    #
    # DELETE:
    # Client only.
    path(
        "<int:milestone_id>/",
        MilestoneDetailView.as_view(),
        name="milestone-detail",
    ),

    # =====================================================
    # FREELANCER PROGRESS
    # =====================================================

    # PATCH:
    # /api/milestones/6/progress/
    #
    # Freelancer only.
    #
    # 0   -> PLANNED
    # 1-99 -> IN_PROGRESS
    # 100 -> SUBMITTED
    path(
        "<int:milestone_id>/progress/",
        MilestoneProgressView.as_view(),
        name="milestone-progress",
    ),

    # =====================================================
    # CLIENT REVIEW
    # =====================================================

    # PATCH:
    # /api/milestones/6/review/
    #
    # action:
    # approve
    # changes
    # cancel
    path(
        "<int:milestone_id>/review/",
        MilestoneReviewView.as_view(),
        name="milestone-review",
    ),
]