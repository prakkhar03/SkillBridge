from django.core.mail import send_mail
from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token)
    }

def send_verification_email(user, token):
    verify_link = f"http://localhost:8000/api/accounts/verify-email/{token}/"
    send_mail(
        "Verify your SkillBridge account",
        f"Click the link to verify your email: {verify_link}",
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
    )

def send_login_alert_email(user):
    send_mail(
        "Login Alert - SkillBridge",
        f"Your account ({user.email}) had a failed login attempt.",
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
    )
