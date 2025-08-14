from django.urls import path
from .views import (
    RegisterView, VerifyEmailView, LoginView,
    LogoutView, ProfileView,ProfileUpdateView,EmailVerifcationstatusView
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("verify-email/<str:token>", VerifyEmailView.as_view(), name="verify-email"),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("profile/", ProfileView.as_view(), name="profile"),
    path("profile/update/", ProfileUpdateView.as_view(), name="profile-update"),
    path("profile/verification-status/", EmailVerifcationstatusView.as_view(), name="email-verification-status"),
]
