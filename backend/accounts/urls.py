from django.urls import path

from .views import (
    RegisterView,
    LoginView,
    PlatformOverviewView,
    ClientTestView,
    FreelancerTestView
)


urlpatterns = [
    path(
        'register/',
        RegisterView.as_view(),
        name='register'
    ),

    path(
        'login/',
        LoginView.as_view(),
        name='login'
    ),
    
    path(
    'overview/',
    PlatformOverviewView.as_view(),
    name='platform-overview'
),

    path(
        'client-test/',
        ClientTestView.as_view(),
        name='client-test'
    ),

    path(
        'freelancer-test/',
        FreelancerTestView.as_view(),
        name='freelancer-test'
    ),
]