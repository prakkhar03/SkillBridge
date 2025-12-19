from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model

from .models import SkillVerification,SkillTest,TestResult
from .serializer import VerificationStatusSerializer, AdminVerifySerializer
from accounts.models import Profile
from .utils.pdf_utils import (
    extract_text_from_pdf_fileobj
)
from .utils.langchain_utils import *

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

    
        resume_text=extract_text_from_pdf_fileobj(profile.resume)
        resume_analysis=analyze_resume(resume_text) if profile.resume else None
        github_analysis=analyze_github_profile(profile.github_url) if profile.github_url else None

        recommendation = generate_final_report(resume_analysis, github_analysis)
        
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
        try:
            verification = SkillVerification.objects.get(user__id=user_id)
            profile = verification.user.profile

            star_rating = request.data.get("star_rating")
            verification_tag = request.data.get("verification_tag")

            if star_rating is None or verification_tag is None:
                return Response(
                    {"message": "star_rating and verification_tag are required"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            profile.star_rating = float(star_rating)
            profile.verification_tag = verification_tag
            profile.save(update_fields=["star_rating", "verification_tag"])

            verification.verification_status = "VERIFIED"
            verification.save(update_fields=["verification_status"])

            return Response(
                {"message": "User verified successfully"},
                status=status.HTTP_200_OK
            )

        except SkillVerification.DoesNotExist:
            return Response(
                {"message": "Verification record not found"},
                status=status.HTTP_404_NOT_FOUND
            )


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
        """Generate a test, store it with correct answers, and return questions only."""
        try:
            profile = get_object_or_404(Profile, user=request.user)
            verification = SkillVerification.objects.filter(user=request.user).order_by('-created_at').first()
            
            # Fallback if no verification analysis was done yet
            resume_analysis = verification.resume_analysis if verification else ""
            github_analysis = verification.github_analysis if verification else ""
            recommendation = verification.gemini_recommendation if verification else f"User profile skills: {profile.skills}"

            try:
                test_data = generate_test(
                    resume_analysis=resume_analysis,
                    github_analysis=github_analysis,
                    skills=profile.skills,
                    recommendation=recommendation
                )
                
                if not isinstance(test_data, dict) or "questions" not in test_data:
                    raise ValueError("Invalid format from AI generator")

            except Exception as e:
                print(f"ERROR: AI test generation failed: {str(e)}")
                # Robust Fallback Test Data
                test_data = {
                    "role": "General Developer",
                    "questions": [
                        {
                            "question": f"Based on your skill '{profile.skills or 'Development'}', what is a key best practice for high-quality code?",
                            "options": ["No testing", "Writing clean, documented code", "Copy-pasting from StackOverflow", "Ignoring security"],
                            "type": "multiple_choice",
                            "difficulty": "Medium",
                            "correct_answer": "Writing clean, documented code"
                        },
                        {
                            "question": "Which of these is a common version control system?",
                            "options": ["Git", "Excel", "Photoshop", "Word"],
                            "type": "multiple_choice",
                            "difficulty": "Easy",
                            "correct_answer": "Git"
                        }
                    ],
                    "answers": ["Writing clean, documented code", "Git"]
                }

            skill_test = SkillTest.objects.create(
                user=request.user,
                questions=test_data["questions"],
                answers=test_data["answers"]
            )

            return Response({
                "message": "Test generated successfully",
                "test_id": skill_test.id,
                "role": test_data.get("role", ""),
                "questions": test_data["questions"]
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            print(f"CRITICAL ERROR in TestView: {str(e)}")
            return Response({"error": "Failed to generate test. Internal server error."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class SubmitTestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, test_id):
        skill_test = get_object_or_404(SkillTest, id=test_id, user=request.user)
        user_answers = request.data.get("answers")

        if not isinstance(user_answers, list):
            return Response({"error": "Answers must be a list"}, status=status.HTTP_400_BAD_REQUEST)

        correct_answers = skill_test.answers
        score = sum(1 for i, ans in enumerate(user_answers) if i < len(correct_answers) and ans == correct_answers[i])
        total = len(correct_answers)
        percentage = (score / total) * 100 if total > 0 else 0
        result = "PASS" if percentage >= 60 else "FAIL"

        # Save test result
        TestResult.objects.create(
            user=request.user,
            test=skill_test,
            score=score,
            total=total,
            percentage=percentage,
            result=result
        )

        # Update verification status to PENDING after test
        verification = SkillVerification.objects.filter(user=request.user).order_by('-created_at').first()
        if verification:
            # Run final analysis
            combined_analysis = final_analysis(
                resume_analysis=verification.resume_analysis,
                github_analysis=verification.github_analysis,
                previous_recommendation=verification.gemini_recommendation,
                test_score=percentage,
                test_result=result
            )
            verification.gemini_recommendation = combined_analysis
            verification.verification_status = "PENDING"  
            verification.save()

        
        profile = Profile.objects.filter(user=request.user).first()
        if profile:
            profile.verification_tag = "Unverified"
            profile.save()

        return Response({
            "score": score,
            "total": total,
            "percentage": percentage,
            "result": result
        }, status=status.HTTP_200_OK)
class VerificationStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        verification = SkillVerification.objects.filter(user=request.user).first()
        if not verification:
            return Response({"status": "Not Started"})

        serializer = VerificationStatusSerializer(verification)
        return Response(serializer.data)