from django.urls import path
from . import views

urlpatterns = [
    path("start/", views.start_verification, name="start_verification"),
    path("status/", views.verification_status, name="verification_status"),
    path("admin-verify/<int:user_id>/", views.admin_verify_user, name="admin_verify_user"),
]
