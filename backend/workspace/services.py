from django.db import transaction

from .models import ProjectWorkspace


@transaction.atomic
def create_project_workspace(
    project,
    freelancer
):
    workspace, created = (
        ProjectWorkspace.objects.get_or_create(
            project=project,
            defaults={
                "client": project.client,
                "freelancer": freelancer,
            }
        )
    )

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