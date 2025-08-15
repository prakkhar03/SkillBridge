from django.core.mail import send_mail
from django.conf import settings
from django.contrib.sites.shortcuts import get_current_site
from django.urls import reverse
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status
from rest_framework.response import Response
from datetime import datetime, timedelta
from django.template.loader import render_to_string
from django.utils import timezone
from django.utils.html import strip_tags

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token)
    }


def send_verification_email(user, token, request=None):
    if request:
        current_site = get_current_site(request).domain
        verification_link = f"http://{current_site}{reverse('verify-email', args=[token])}"
    else:
        verification_link = f"http://localhost:8000{reverse('verify-email', args=[token])}"

    name = getattr(user, 'full_name', None) or user.email
    subject = "Verify your SkillBridge account"

    html_message = render_to_string('email.html', {
        'user_name': name,
        'verification_link': verification_link,
        'current_year': timezone.now().year
    })
    plain_message = strip_tags(html_message)

    send_mail(subject, plain_message, settings.DEFAULT_FROM_EMAIL, [user.email], html_message=html_message)

def send_login_alert_email(user):
    send_mail(
        "Login Alert - SkillBridge",
        f"Your account ({user.email}) had a failed login attempt.",
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
    )
