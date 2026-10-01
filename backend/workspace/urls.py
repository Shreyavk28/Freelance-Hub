from django.urls import path

from .views import (
    WorkspaceListView,
    WorkspaceDetailView,
    ProjectWorkspaceView,
    ProjectFileListCreateView,
    ProjectFileDeleteView,
)


urlpatterns = [

    # =====================================================
    # WORKSPACE
    # =====================================================

    path(
        "",
        WorkspaceListView.as_view(),
        name="workspace-list"
    ),

    path(
        "<int:workspace_id>/",
        WorkspaceDetailView.as_view(),
        name="workspace-detail"
    ),

    path(
        "project/<int:project_id>/",
        ProjectWorkspaceView.as_view(),
        name="project-workspace"
    ),

    # =====================================================
    # FILES
    # =====================================================

    path(
        "project/<int:project_id>/files/",
        ProjectFileListCreateView.as_view(),
        name="project-files"
    ),

    path(
        "project/<int:project_id>/files/<int:file_id>/",
        ProjectFileDeleteView.as_view(),
        name="project-file-delete"
    ),
]