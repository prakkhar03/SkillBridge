from django.db import IntegrityError, transaction
from rest_framework import status, serializers
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.core.validators import EmailValidator
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.cache import cache
import logging
from accounts.utils import send_verification_email, get_tokens_for_user, send_login_alert_email
from .serializer import RegisterSerializer, LoginSerializer, UserDataSerializer,ProfileSerializer
from accounts.models import User

logger = logging.getLogger(__name__)

ATTEMPT_LIMIT = 3
COOLDOWN_SECONDS = 300


class RegisterView(APIView):
    serializer_class = RegisterSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        try:
            with transaction.atomic():
                email = request.data.get("email")
                if not email:
                    return Response({"message": "Email is required"}, status=400)

                email = email.lower()
                try:
                    EmailValidator()(email)
                except DjangoValidationError:
                    return Response({"message": "Invalid email format"}, status=400)

                existing_user = User.objects.filter(email=email).first()
                if existing_user:
                    if not existing_user.verified:
                        tokens = get_tokens_for_user(existing_user)
                        send_verification_email(existing_user, tokens['access'])
                        return Response({"message": "User exists but not verified. Verification email resent."}, status=403)
                    return Response({"message": "Email already registered"}, status=409)

                serializer.is_valid(raise_exception=True)
                user = serializer.save()
                tokens = get_tokens_for_user(user)
                send_verification_email(user, tokens['access'])

                return Response({
                    "status": 201,
                    "message": "User created successfully. Verification email sent.",
                    "data": {
                        "user": serializer.data,
                        "tokens": tokens
                    }
                }, status=201)
        except Exception as e:
            logger.error(f"Registration error: {str(e)}")
            return Response({"message": "Error during registration", "error": str(e)}, status=500)


class VerifyEmailView(APIView):
    def get(self, request, token):
        try:
            access_token = AccessToken(token)
            user_id = access_token["user_id"]
            user = User.objects.get(id=user_id)

            if user.verified:
                return Response({"message": "Email already verified"}, status=200)

            user.verified = True
            user.onboarding_stage = 1
            user.save()

            return Response({"message": "Email verified successfully"}, status=200)

        except Exception as e:
            logger.error(f"Email verification error: {str(e)}")
            return Response({"message": "Invalid or expired token"}, status=400)


class LoginView(APIView):
    serializer_class = LoginSerializer

    def post(self, request):
        email = request.data.get("email", "").lower()
        cache_key_attempts = f"login_attempts_{email}"
        cache_key_blocked = f"login_blocked_{email}"

        if cache.get(cache_key_blocked):
            return Response({"message": "Too many failed attempts. Try again later."}, status=429)

        serializer = self.serializer_class(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            user = serializer.context['user']
            if not user.verified:
                tokens = get_tokens_for_user(user)
                send_verification_email(user, tokens['access'])
                return Response({"message": "Email not verified. Verification email resent."}, status=403)

            cache.delete(cache_key_attempts)
            cache.delete(cache_key_blocked)

            user.last_login = timezone.now()
            user.save()
            tokens = get_tokens_for_user(user)

            return Response({
                "message": "Login successful",
                "data": {
                    "user": UserDataSerializer(user).data,
                    "tokens": tokens
                }
            }, status=200)
        except serializers.ValidationError as e:
            attempts = cache.get(cache_key_attempts, 0) + 1
            cache.set(cache_key_attempts, attempts, timeout=COOLDOWN_SECONDS)

            if attempts >= ATTEMPT_LIMIT:
                cache.set(cache_key_blocked, True, timeout=COOLDOWN_SECONDS)
                user = User.objects.filter(email=email).first()
                if user:
                    send_login_alert_email(user)

            return Response({"message": "Invalid credentials", "errors": e.detail}, status=400)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                return Response({"message": "Refresh token required"}, status=400)
            try:
                RefreshToken(refresh_token).blacklist()
            except TokenError:
                return Response({"message": "Invalid token"}, status=400)

            return Response({"message": "Logged out successfully"}, status=205)
        except Exception as e:
            logger.error(f"Logout error: {str(e)}")
            return Response({"message": "Error during logout", "error": str(e)}, status=500)
class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({"data": UserDataSerializer(request.user).data})

class ProfileUpdateView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProfileSerializer

    def get(self, request):
        """
        Return the logged-in user's profile details.
        """
        profile = request.user.profile
        serializer = self.serializer_class(profile)
        return Response({"data": serializer.data})

    def put(self, request):
        """
        Full update of profile (replace all fields).
        """
        return self._update_profile(request)

    def patch(self, request):
        """
        Partial update of profile (only provided fields will be updated).
        """
        return self._update_profile(request, partial=True)

    def delete(self, request):
        """
        Delete the logged-in user's profile.
        """
        profile = request.user.profile
        profile.delete()
        return Response({"message": "Profile deleted successfully"}, status=204)

    def _update_profile(self, request, partial=False):
        """
        Shared logic for PUT and PATCH.
        """
        profile = request.user.profile
        serializer = self.serializer_class(profile, data=request.data, partial=partial)

        if serializer.is_valid():
            serializer.save()

            # Automatically move onboarding stage forward if not already completed
            user = request.user
            if user.onboarding_stage < 2:
                user.onboarding_stage = 2
                user.save(update_fields=["onboarding_stage"])

            return Response(
                {
                    "message": "Profile updated successfully",
                    "data": serializer.data
                },
                status=200
            )

        return Response({"errors": serializer.errors}, status=400)

class EmailVerifcationstatusView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """
        Check if the user's email is verified.
        """
        user = request.user
        return Response({"email_verified": user.verified}, status=200)