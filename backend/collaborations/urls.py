from django.urls import path

from .views import (
    SendInvitationView,
    ClientInvitationsView,
    FreelancerInvitationsView,
    InvitationDecisionView,
)


urlpatterns = [

    path(
        "invite/",
        SendInvitationView.as_view(),
        name="send-invitation"
    ),

    path(
        "client/",
        ClientInvitationsView.as_view(),
        name="client-invitations"
    ),

    path(
        "freelancer/",
        FreelancerInvitationsView.as_view(),
        name="freelancer-invitations"
    ),

    path(
        "<int:invitation_id>/decision/",
        InvitationDecisionView.as_view(),
        name="invitation-decision"
    ),

]