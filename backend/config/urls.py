from django.contrib import admin
from django.urls import path, include

urlpatterns = [

    path(
        "admin/",
        admin.site.urls
    ),

    path(
        "api/auth/",
        include("accounts.urls")
    ),

    path(
        "api/profiles/",
        include("profiles.urls")
    ),

    path(
        "api/skills/",
        include("skills.urls")
    ),

    path(
        "api/projects/",
        include("projects.urls")
    ),

    path(
        "api/proposals/",
        include("proposals.urls")
    ),

    path(
        "api/collaborations/",
        include("collaborations.urls")
    ),
    path("api/workspaces/", include("workspace.urls")),
]