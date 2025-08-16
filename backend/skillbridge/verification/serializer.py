from rest_framework import serializers
from .models import SkillVerification
from accounts.models import Profile


class VerificationStartSerializer(serializers.Serializer):
    github_url = serializers.URLField(required=False)


class VerificationStatusSerializer(serializers.ModelSerializer):
    resume = serializers.SerializerMethodField()
    github_url = serializers.SerializerMethodField()
    skills = serializers.SerializerMethodField()

    class Meta:
        model = SkillVerification
        fields = [
            "id", "resume", "github_url", "skills",
            "resume_analysis", "github_analysis",
            "gemini_recommendation", "verification_status",
            "created_at", "updated_at"
        ]

    def get_resume(self, obj):
        return obj.user.profile.resume.url if obj.user.profile.resume else None

    def get_github_url(self, obj):
        return obj.user.profile.github_url

    def get_skills(self, obj):
        return obj.user.profile.skills


class AdminVerifySerializer(serializers.Serializer):
    star_rating = serializers.DecimalField(max_digits=2, decimal_places=1, required=False)
    tags = serializers.ChoiceField(
        choices=["Unverified", "Beginner", "Intermediate", "Expert"],
        required=False
    )