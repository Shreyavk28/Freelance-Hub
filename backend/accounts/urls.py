from django.urls import path

from .views import (
    RegisterView,
    LoginView,
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