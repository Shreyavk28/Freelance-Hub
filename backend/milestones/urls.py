from django.urls import path

from .views import (
    ProjectMilestoneListCreateView,
    MilestoneProgressView,
    MilestoneReviewView,
    MilestoneDetailView,
)


urlpatterns = [

    # GET all milestones
    # POST create milestone - CLIENT only
    path(
        "project/<int:project_id>/",
        ProjectMilestoneListCreateView.as_view(),
        name="project-milestones"
    ),

    # GET individual milestone
    path(
        "<int:milestone_id>/",
        MilestoneDetailView.as_view(),
        name="milestone-detail"
    ),

    # PATCH progress - FREELANCER only
    path(
        "<int:milestone_id>/progress/",
        MilestoneProgressView.as_view(),
        name="milestone-progress"
    ),

    # PATCH review - CLIENT only
    path(
        "<int:milestone_id>/review/",
        MilestoneReviewView.as_view(),
        name="milestone-review"
    ),
]