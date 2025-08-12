from rest_framework.decorators import api_view, permission_classes
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
    generate_gemini_recommendation
)

User = get_user_model()


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def start_verification(request):
    # Get profile
    profile = get_object_or_404(Profile, user=request.user)

    # Require at least one source
    if not profile.resume and not profile.github_url:
        return Response(
            {"error": "Resume or GitHub URL is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Always create a new record (allow multiple verifications)
    verification = SkillVerification.objects.create(
        user=request.user,
        verification_status="PENDING"
    )

    # Analyze resume (if available)
    resume_analysis = None
    if profile.resume:
        resume_analysis = extract_and_analyze_resume(profile.resume)

    # Analyze GitHub (if available)
    github_analysis = None
    if profile.github_url:
        github_analysis = analyze_github_with_gemini(profile.github_url)

    # Generate recommendation
    recommendation = generate_gemini_recommendation(
        resume_analysis or "",
        github_analysis or "",
        profile.skills
    )

    verification.resume_analysis = resume_analysis or ""
    verification.github_analysis = github_analysis or ""
    verification.gemini_recommendation = recommendation
    verification.verification_status = "PENDING"
    verification.save()

    return Response({"message": "Verification started", "id": verification.id}, status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def verification_status(request):
    """Get the latest verification for the logged-in user."""
    verification = SkillVerification.objects.filter(user=request.user).order_by('-created_at').first()
    if not verification:
        return Response({"error": "No verification found"}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = VerificationStatusSerializer(verification)
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAdminUser])
def admin_verify_user(request, user_id):
    """Admin sets star rating & tags, marks latest verification as VERIFIED."""
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
