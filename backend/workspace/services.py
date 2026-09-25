from django.db import transaction

from .models import ProjectWorkspace


@transaction.atomic
def create_project_workspace(
    project,
    freelancer
):
    """
    Create or retrieve the workspace for a project.

    A project can have only one workspace because the
    ProjectWorkspace.project field is OneToOneField.
    """

    workspace, created = (
        ProjectWorkspace.objects.get_or_create(
            project=project,
            defaults={
                "client": project.client,
                "freelancer": freelancer,
            }
        )
    )

    # -------------------------------------------------
    # SAFETY
    #
    # If the workspace already exists but the participant
    # information is different, synchronize it.
    # -------------------------------------------------

    changed = False

    if workspace.client_id != project.client_id:

        workspace.client = project.client
        changed = True

    if workspace.freelancer_id != freelancer.id:

        workspace.freelancer = freelancer
        changed = True

    if changed:

        workspace.save(
            update_fields=[
                "client",
                "freelancer",
                "updated_at",
            ]
        )

    return workspace, created