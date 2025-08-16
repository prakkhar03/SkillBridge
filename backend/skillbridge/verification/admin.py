from django.contrib import admin
from .models import SkillVerification, SkillTest, TestResult
from accounts.models import Profile

@admin.action(description="Approve selected verifications (with edited rating & tag)")
def approve_verifications(modeladmin, request, queryset):
    for verification in queryset:
        profile = verification.user.profile
        
        if not profile.verification_tag or profile.verification_tag == "Unverified":
            if isinstance(verification.gemini_recommendation, dict):
                tag = verification.gemini_recommendation.get("recommended_tags", ["Unverified"])[0]
                rating = verification.gemini_recommendation.get("star_rating", 0)
            else:
                tag = "Unverified"
                rating = 0
            profile.verification_tag = tag
            profile.star_rating = rating

        profile.save()
        verification.verification_status = "VERIFIED"
        verification.save()


@admin.register(SkillVerification)
class SkillVerificationAdmin(admin.ModelAdmin):
    list_display = ("user_id_display", "star_rating_display", "tag_display", "verification_status", "created_at")
    search_fields = ("user__email",)
    actions = [approve_verifications]
    readonly_fields = ("gemini_recommendation",)

    def get_queryset(self, request):
        """
        Show only pending verifications for users who have completed a test.
        """
        qs = super().get_queryset(request)
        return qs.filter(
            verification_status="PENDING",
            user__test_results__isnull=False  # must have a TestResult
        ).distinct()

    def user_id_display(self, obj):
        return obj.user.id
    user_id_display.short_description = "User ID"

    def star_rating_display(self, obj):
        return obj.user.profile.star_rating if hasattr(obj.user, 'profile') else ""
    star_rating_display.short_description = "Star Rating"

    def tag_display(self, obj):
        return obj.user.profile.verification_tag if hasattr(obj.user, 'profile') else ""
    tag_display.short_description = "Verification Tag"


@admin.register(SkillTest)
class SkillTestAdmin(admin.ModelAdmin):
    list_display = ("user", "created_at")
    search_fields = ("user__email",)


@admin.register(TestResult)
class TestResultAdmin(admin.ModelAdmin):
    list_display = ("user", "test", "score", "percentage", "result", "created_at")
    list_filter = ("result",)
    search_fields = ("user__email",)
