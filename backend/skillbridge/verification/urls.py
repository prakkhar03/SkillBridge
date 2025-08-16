from django.urls import path
from . import views

urlpatterns = [
    path("start/", views.StartVerificationView.as_view(), name="start_verification"),
    path("status/", views.VerificationStatusView.as_view(), name="verification_status"),
    path("admin-verify/<int:user_id>/", views.AdminVerifyUserView.as_view(), name="admin_verify_user"),
    path("recommendation/", views.UserRecommendationView.as_view(), name="user_recommendation"),
    path("test/", views.TestView.as_view(), name="test_view"),
    path("test/<int:test_id>/submit/", views.SubmitTestView.as_view(), name="submit-test"),
]
