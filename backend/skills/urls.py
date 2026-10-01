from django.urls import path

from .views import (
    SkillListView,
    FreelancerSkillView,
    FreelancerSkillDeleteView
)


urlpatterns = [

    path(
        '',
        SkillListView.as_view(),
        name='skill-list'
    ),

    path(
        'freelancer/',
        FreelancerSkillView.as_view(),
        name='freelancer-skills'
    ),

    path(
        'freelancer/<int:skill_id>/',
        FreelancerSkillDeleteView.as_view(),
        name='delete-freelancer-skill'
    ),
]