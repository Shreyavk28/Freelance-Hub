from django.urls import path

from .views import (
    ProjectListCreateView,
    MyProjectsView,
    ProjectDetailView
)


urlpatterns = [

    path(
        '',
        ProjectListCreateView.as_view(),
        name='project-list-create'
    ),

    path(
        'my/',
        MyProjectsView.as_view(),
        name='my-projects'
    ),

    path(
        '<int:project_id>/',
        ProjectDetailView.as_view(),
        name='project-detail'
    ),
]