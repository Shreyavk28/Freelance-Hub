from django.db import models
from django.shortcuts import get_object_or_404



from rest_framework.views import APIView

from rest_framework.response import Response

from rest_framework.permissions import IsAuthenticated

from rest_framework import status



from accounts.models import User

from projects.models import Project

from proposals.models import Proposal



from .models import (

    ProjectWorkspace,

    ProjectFile

)



from .serializers import (

    ProjectWorkspaceSerializer,

    ProjectFileSerializer

)



from .services import create_project_workspace





# =========================================================

# WORKSPACE LIST

# =========================================================



class WorkspaceListView(APIView):



    permission_classes = [IsAuthenticated]



    def get(self, request):

        # Workspace membership is based on the project relationship,
        # not on the user's global role. A FREELANCER can own a
        # project and therefore appear as the workspace client.
        workspaces = (
            ProjectWorkspace.objects
            .filter(
                models.Q(client=request.user)
                | models.Q(freelancer=request.user)
            )
            .select_related(
                "project",
                "client",
                "freelancer"
            )
            .order_by("-created_at")
        )

        serializer = ProjectWorkspaceSerializer(

            workspaces,

            many=True

        )



        return Response(

            serializer.data,

            status=status.HTTP_200_OK

        )





# =========================================================

# WORKSPACE DETAIL

# =========================================================



class WorkspaceDetailView(APIView):



    permission_classes = [IsAuthenticated]



    def get(

        self,

        request,

        workspace_id

    ):



        workspace = get_object_or_404(

            ProjectWorkspace.objects.select_related(

                "project",

                "client",

                "freelancer"

            ),

            id=workspace_id

        )



        if (

            workspace.client_id != request.user.id

            and

            workspace.freelancer_id != request.user.id

        ):



            return Response(

                {

                    "detail": (

                        "You do not have access "

                        "to this workspace."

                    )

                },

                status=status.HTTP_403_FORBIDDEN

            )



        serializer = ProjectWorkspaceSerializer(

            workspace,

            context={

                "request": request

            }

        )



        return Response(

            serializer.data,

            status=status.HTTP_200_OK

        )





# =========================================================

# PROJECT WORKSPACE

# =========================================================



class ProjectWorkspaceView(APIView):



    permission_classes = [IsAuthenticated]



    def get(

        self,

        request,

        project_id

    ):



        project = get_object_or_404(

            Project.objects.select_related(

                "client"

            ),

            id=project_id

        )



        try:



            workspace = (

                ProjectWorkspace.objects

                .select_related(

                    "project",

                    "client",

                    "freelancer"

                )

                .get(

                    project=project

                )

            )



        except ProjectWorkspace.DoesNotExist:



            if (

                project.status

                != Project.Status.IN_PROGRESS

            ):



                return Response(

                    {

                        "detail": (

                            "Workspace has not been "

                            "created for this project yet."

                        )

                    },

                    status=status.HTTP_404_NOT_FOUND

                )



            accepted_proposal = (

                Proposal.objects

                .select_related(

                    "freelancer"

                )

                .filter(

                    project=project,

                    status=Proposal.Status.ACCEPTED

                )

                .order_by(

                    "-updated_at"

                )

                .first()

            )



            if accepted_proposal is None:



                return Response(

                    {

                        "detail": (

                            "Project is in progress, "

                            "but no accepted proposal "

                            "was found."

                        )

                    },

                    status=status.HTTP_404_NOT_FOUND

                )



            freelancer = accepted_proposal.freelancer



            workspace, workspace_created = (

                create_project_workspace(

                    project=project,

                    freelancer=freelancer

                )

            )



            workspace = (

                ProjectWorkspace.objects

                .select_related(

                    "project",

                    "client",

                    "freelancer"

                )

                .get(

                    id=workspace.id

                )

            )



        if (

            workspace.client_id != request.user.id

            and

            workspace.freelancer_id != request.user.id

        ):



            return Response(

                {

                    "detail": (

                        "You do not have access "

                        "to this workspace."

                    )

                },

                status=status.HTTP_403_FORBIDDEN

            )



        serializer = ProjectWorkspaceSerializer(

            workspace,

            context={

                "request": request

            }

        )



        return Response(

            serializer.data,

            status=status.HTTP_200_OK

        )





# =========================================================

# PROJECT FILE LIST + UPLOAD

# =========================================================



class ProjectFileListCreateView(APIView):



    permission_classes = [IsAuthenticated]



    # =====================================================

    # GET WORKSPACE

    # =====================================================



    def get_project_workspace(

        self,

        request,

        project_id

    ):



        project = get_object_or_404(

            Project,

            id=project_id

        )



        workspace = get_object_or_404(

            ProjectWorkspace.objects.select_related(

                "project",

                "client",

                "freelancer"

            ),

            project=project

        )



        if (

            workspace.client_id != request.user.id

            and

            workspace.freelancer_id != request.user.id

        ):



            return None, Response(

                {

                    "detail": (

                        "You do not have access "

                        "to this project."

                    )

                },

                status=status.HTTP_403_FORBIDDEN

            )



        return workspace, None



    # =====================================================

    # GET FILES

    # =====================================================



    def get(

        self,

        request,

        project_id

    ):



        workspace, error_response = (

            self.get_project_workspace(

                request,

                project_id

            )

        )



        if error_response:



            return error_response



        files = (

            ProjectFile.objects

            .filter(

                project=workspace.project

            )

            .select_related(

                "uploaded_by"

            )

            .order_by(

                "-uploaded_at"

            )

        )



        serializer = ProjectFileSerializer(

            files,

            many=True,

            context={

                "request": request

            }

        )



        return Response(

            serializer.data,

            status=status.HTTP_200_OK

        )



    # =====================================================

    # UPLOAD FILE

    # =====================================================



    def post(

        self,

        request,

        project_id

    ):



        workspace, error_response = (

            self.get_project_workspace(

                request,

                project_id

            )

        )



        if error_response:



            return error_response



        uploaded_file = request.FILES.get(

            "file"

        )



        if uploaded_file is None:



            return Response(

                {

                    "detail": "Please select a file."

                },

                status=status.HTTP_400_BAD_REQUEST

            )



        project_file = ProjectFile.objects.create(

            project=workspace.project,

            uploaded_by=request.user,

            file=uploaded_file,

            original_name=uploaded_file.name

        )



        serializer = ProjectFileSerializer(

            project_file,

            context={

                "request": request

            }

        )



        return Response(

            serializer.data,

            status=status.HTTP_201_CREATED

        )





# =========================================================

# DELETE PROJECT FILE

# =========================================================

# =========================================================

# DELETE PROJECT FILE

# =========================================================



class ProjectFileDeleteView(APIView):



    permission_classes = [IsAuthenticated]



    def delete(

        self,

        request,

        project_id,

        file_id

    ):



        # -------------------------------------------------

        # GET PROJECT

        # -------------------------------------------------



        project = get_object_or_404(

            Project,

            id=project_id

        )





        # -------------------------------------------------

        # GET WORKSPACE

        # -------------------------------------------------



        workspace = get_object_or_404(

            ProjectWorkspace,

            project=project

        )





        # -------------------------------------------------

        # CHECK WORKSPACE ACCESS

        # -------------------------------------------------



        if (

            workspace.client_id != request.user.id

            and

            workspace.freelancer_id != request.user.id

        ):



            return Response(

                {

                    "detail": (

                        "You do not have access "

                        "to this project."

                    )

                },

                status=status.HTTP_403_FORBIDDEN

            )





        # -------------------------------------------------

        # GET FILE

        #

        # IMPORTANT:

        # We do NOT restrict the query here by

        # uploaded_by because we want to return a

        # proper permission message below.

        # -------------------------------------------------



        project_file = get_object_or_404(

            ProjectFile,

            id=file_id,

            project=project

        )





        # -------------------------------------------------

        # IMPORTANT OWNERSHIP CHECK

        #

        # Only the person who uploaded the file

        # can delete it.

        # -------------------------------------------------



        if (

            project_file.uploaded_by_id

            != request.user.id

        ):



            return Response(

                {

                    "detail": (

                        "You can only delete "

                        "files uploaded by you."

                    )

                },

                status=status.HTTP_403_FORBIDDEN

            )





        # -------------------------------------------------

        # DELETE PHYSICAL FILE

        # -------------------------------------------------



        if project_file.file:



            project_file.file.delete(

                save=False

            )





        # -------------------------------------------------

        # DELETE DATABASE RECORD

        # -------------------------------------------------



        project_file.delete()





        return Response(

            {

                "detail": "File deleted successfully."

            },

            status=status.HTTP_204_NO_CONTENT

        )