from django.urls import path,include
from .views import (
    RegisterView, VerifyEmailView, LoginView,
    LogoutView, ProfileView,ProfileUpdateView,EmailVerifcationstatusView,ClientCompanyViewSet, ClientDocumentViewSet, ClientContactViewSet,ProfileByIdView
)
from rest_framework.routers import DefaultRouter

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("verify-email/<str:token>", VerifyEmailView.as_view(), name="verify-email"),
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("profile/", ProfileView.as_view(), name="profile"),
    path("profile/update/", ProfileUpdateView.as_view(), name="profile-update"),
    path("profile/verification-status/", EmailVerifcationstatusView.as_view(), name="email-verification-status"),
    path("profile/<int:user_id>/", ProfileByIdView.as_view(), name="profile-by-id"),

]

router = DefaultRouter()
router.register("companies", ClientCompanyViewSet, basename="client-company")
router.register("documents", ClientDocumentViewSet, basename="client-document")
router.register("contacts", ClientContactViewSet, basename="client-contact")

urlpatterns += [
    path("client/", include(router.urls)),
]
