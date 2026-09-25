from django.urls import path

from .views import (
    ProjectListCreateView,
    MyProjectsView,
    ProjectDetailView,
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

    path(
        "<int:project_id>/milestones/",
        ProjectMilestoneListCreateView.as_view(),
        name="project-milestones"
    ),

    path(
        "<int:project_id>/milestones/<int:milestone_id>/",
        MilestoneDetailView.as_view(),
        name="milestone-detail"
    ),
]