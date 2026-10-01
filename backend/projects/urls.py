from django.urls import path

from .views import (
    ProjectListCreateView,
    MyProjectsView,
    ProjectDetailView,
)

# Milestone views belong to the milestones app.
# We import them here only so the frontend can continue
# using /api/projects/<project_id>/milestones/
from milestones.views import (
    ProjectMilestoneListCreateView,
    MilestoneDetailView,
)


urlpatterns = [

    # =========================================
    # PROJECTS
    # =========================================

    path(
        "",
        ProjectListCreateView.as_view(),
        name="project-list-create"
    ),

    path(
        "my/",
        MyProjectsView.as_view(),
        name="my-projects"
    ),

    path(
        "<int:project_id>/",
        ProjectDetailView.as_view(),
        name="project-detail"
    ),

    # =========================================
    # MILESTONES
    # =========================================

    # GET milestones
    # POST milestone - CLIENT only
    path(
        "<int:project_id>/milestones/",
        ProjectMilestoneListCreateView.as_view(),
        name="project-milestones"
    ),

    # GET individual milestone
    path(
        "<int:project_id>/milestones/<int:milestone_id>/",
        MilestoneDetailView.as_view(),
        name="project-milestone-detail"
    ),
]