from django.urls import path

from .views import (
    WorkspaceListView,
    WorkspaceDetailView,
    ProjectWorkspaceView,
)


urlpatterns = [

    # Get all workspaces belonging to the logged-in user
    path(
        "",
        WorkspaceListView.as_view(),
        name="workspace-list"
    ),

    # Get a specific workspace by workspace ID
    path(
        "<int:workspace_id>/",
        WorkspaceDetailView.as_view(),
        name="workspace-detail"
    ),

    # Get workspace using project ID
    path(
        "project/<int:project_id>/",
        ProjectWorkspaceView.as_view(),
        name="project-workspace"
    ),
]