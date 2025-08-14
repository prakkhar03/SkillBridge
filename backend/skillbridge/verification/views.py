from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model

from .models import SkillVerification
from .serializer import VerificationStatusSerializer, AdminVerifySerializer
from accounts.models import Profile
from .utils import (
    extract_text_from_pdf_fileobj,
    extract_and_analyze_resume,
    analyze_github_with_gemini,
    generate_gemini_recommendation,
    generate_tests_based_on_profile
)

User = get_user_model()


class StartVerificationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        profile = get_object_or_404(Profile, user=request.user)

        if not profile.resume and not profile.github_url:
            return Response(
                {"error": "Resume or GitHub URL is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        verification = SkillVerification.objects.filter(user=request.user).order_by('-created_at').first()

        if verification:
            verification.verification_status = "PENDING"
        else:
            verification = SkillVerification(user=request.user, verification_status="PENDING")

        resume_analysis = extract_and_analyze_resume(profile.resume) if profile.resume else None
        github_analysis = analyze_github_with_gemini(profile.github_url) if profile.github_url else None

        recommendation = generate_gemini_recommendation(
            resume_analysis or "",
            github_analysis or "",
            profile.skills
        )

        verification.resume_analysis = resume_analysis or ""
        verification.github_analysis = github_analysis or ""
        verification.gemini_recommendation = recommendation
        verification.save()

        return Response({"message": "Verification started/updated", "id": verification.id}, status=status.HTTP_200_OK)


class VerificationStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        verification = SkillVerification.objects.filter(user=request.user).order_by('-created_at').first()
        if not verification:
            return Response({"error": "No verification found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = VerificationStatusSerializer(verification)
        return Response(serializer.data)


class AdminVerifyUserView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, user_id):
        serializer = AdminVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        target_user = get_object_or_404(User, id=user_id)
        profile = get_object_or_404(Profile, user=target_user)
        verification = SkillVerification.objects.filter(user=target_user).order_by('-created_at').first()

        if not verification:
            return Response({"error": "No verification found for this user"}, status=status.HTTP_404_NOT_FOUND)

        profile.star_rating = serializer.validated_data["star_rating"]
        profile.verification_tag = serializer.validated_data["tags"]
        profile.save()

        verification.verification_status = "VERIFIED"
        verification.save()

        return Response({
            "message": f"User {target_user.email} verified successfully",
            "star_rating": profile.star_rating,
            "verification_tag": profile.verification_tag
        })


class UserRecommendationView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = get_object_or_404(Profile, user=request.user)
        verification = SkillVerification.objects.filter(user=request.user).order_by('-created_at').first()

        if not verification or not verification.gemini_recommendation:
            return Response({"error": "No recommendation available"}, status=status.HTTP_404_NOT_FOUND)

        return Response(verification.gemini_recommendation, status=status.HTTP_200_OK)

class TestView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        profile = get_object_or_404(Profile, user=request.user)
        verification = SkillVerification.objects.filter(user=request.user).order_by('-created_at').first()

        if not verification:
            return Response({"error": "No verification found"}, status=status.HTTP_404_NOT_FOUND)
        
        resume_analysis = verification.resume_analysis
        github_analysis = verification.github_analysis
        skills = profile.skills
        recommendation = verification.gemini_recommendation
        
        test_questions = generate_tests_based_on_profile(
            resume_analysis=resume_analysis,
            github_analysis=github_analysis,
            skills=skills,
            recommendation=recommendation
        )
        return Response(test_questions, status=status.HTTP_200_OK)

