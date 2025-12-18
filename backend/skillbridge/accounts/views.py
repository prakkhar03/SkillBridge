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
from .serializer import RegisterSerializer, LoginSerializer, UserDataSerializer, ProfileSerializer, ClientCompanySerializer, ClientDocumentSerializer, ClientContactSerializer
from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import ClientCompany, ClientDocument, ClientContact,User
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
                    # Allow login even if not verified
                    tokens = get_tokens_for_user(existing_user)
                    return Response({
                        "message": "User exists. Logging in directly.",
                        "data": {
                            "user": UserDataSerializer(existing_user).data,
                            "tokens": tokens
                        }
                    }, status=200)
                    return Response({"message": "Email already registered"}, status=409)

                serializer.is_valid(raise_exception=True)
                user = serializer.save()
                tokens = get_tokens_for_user(user)
                # Temporarily commented out due to email configuration issues
                # send_verification_email(user, tokens['access'])

                return Response({
                    "status": 201,
                    "message": "User created successfully. Email verification temporarily disabled.",
                    "data": {
                        "user": UserDataSerializer(user).data,
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
            # Verification check bypassed as per user request

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
                    # Temporarily commented out due to email configuration issues
                    # send_login_alert_email(user)
                    pass

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


class IsClientUser(permissions.BasePermission):
    """Allow access only to users with role=client"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "client"


class ClientCompanyViewSet(viewsets.ModelViewSet):
    serializer_class = ClientCompanySerializer
    permission_classes = [permissions.IsAuthenticated, IsClientUser]

    def get_queryset(self):
        return ClientCompany.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        company = serializer.save(user=self.request.user)

        # Auto move to stage 1 when company info is created
        if company.onboarding_stage == 0:
            company.onboarding_stage = 1
            company.save()

            # sync with user onboarding stage
            company.user.onboarding_stage = 1
            company.user.save(update_fields=["onboarding_stage"])


class ClientDocumentViewSet(viewsets.ModelViewSet):
    serializer_class = ClientDocumentSerializer
    permission_classes = [permissions.IsAuthenticated, IsClientUser]

    def get_queryset(self):
        return ClientDocument.objects.filter(client_company__user=self.request.user)

    def perform_create(self, serializer):
        company = ClientCompany.objects.get(user=self.request.user)
        serializer.save(client_company=company)

        # Auto move to stage 2 when first document is uploaded
        if company.onboarding_stage < 2:
            company.onboarding_stage = 2
            company.save()

            # sync with user onboarding stage
            company.user.onboarding_stage = 2
            company.user.save(update_fields=["onboarding_stage"])


class ClientContactViewSet(viewsets.ModelViewSet):
    serializer_class = ClientContactSerializer
    permission_classes = [permissions.IsAuthenticated, IsClientUser]

    def get_queryset(self):
        return ClientContact.objects.filter(client_company__user=self.request.user)

    def perform_create(self, serializer):
        company = ClientCompany.objects.get(user=self.request.user)
        serializer.save(client_company=company)
        
class ProfileByIdView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ProfileSerializer
    def get(self, request, user_id):
        """
        Return the profile details of a user by their ID.
        """
        try:
            user = User.objects.get(id=user_id)
            profile = user.profile
            serializer = self.serializer_class(profile)
            return Response({"data": serializer.data})
        except User.DoesNotExist:
            return Response({"message": "User not found"}, status=404)
        except Exception as e:
            logger.error(f"Error fetching profile by ID: {str(e)}")
            return Response({"message": "Error fetching profile", "error": str(e)}, status=500)
