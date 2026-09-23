from django.contrib import admin
from django.urls import path, include


urlpatterns = [

    # Django Admin
    path(
        "admin/",
        admin.site.urls
    ),

    # Authentication
    # Login, Register, Platform Overview, etc.
    path(
        "api/auth/",
        include("accounts.urls")
    ),

    # Profiles
    path(
        "api/profiles/",
        include("profiles.urls")
    ),

    # Skills
    path(
        "api/skills/",
        include("skills.urls")
    ),

    # Projects
    path(
        "api/projects/",
        include("projects.urls")
    ),

    # Proposals
    path(
        "api/proposals/",
        include("proposals.urls")
    ),

    # Collaborations
    path(
        "api/collaborations/",
        include("collaborations.urls")
    ),

    # Workspaces
    path(
        "api/workspaces/",
        include("workspace.urls")
    ),
]