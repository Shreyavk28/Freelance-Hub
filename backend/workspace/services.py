from .models import ProjectWorkspace


def create_project_workspace(project, freelancer):
    """
    Create a workspace for a project and freelancer.

    If the workspace already exists, return the existing workspace.
    """

    workspace, created = ProjectWorkspace.objects.get_or_create(
        project=project,
        defaults={
            "client": project.client,
            "freelancer": freelancer,
        }
    )

    return workspace, created