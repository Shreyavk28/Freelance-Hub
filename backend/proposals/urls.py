from django.urls import path

from .views import (
    ProposalCreateView,
    MyProposalsView,
    ProjectProposalsView,
    ProposalDecisionView
)


urlpatterns = [

    path(
        '',
        ProposalCreateView.as_view(),
        name='proposal-create'
    ),

    path(
        'my/',
        MyProposalsView.as_view(),
        name='my-proposals'
    ),

    path(
        'project/<int:project_id>/',
        ProjectProposalsView.as_view(),
        name='project-proposals'
    ),

    path(
        '<int:proposal_id>/decision/',
        ProposalDecisionView.as_view(),
        name='proposal-decision'
    ),
]