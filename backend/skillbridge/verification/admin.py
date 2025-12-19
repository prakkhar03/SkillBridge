from django.contrib import admin
from django.utils.html import format_html
from .models import SkillVerification, SkillTest, TestResult
from accounts.models import Profile


@admin.register(SkillVerification)
class SkillVerificationAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "verification_status",
        "created_at",
        "admin_action",
    )

    list_filter = ("verification_status",)
    search_fields = ("user__email",)

    readonly_fields = (
        "resume_analysis",
        "github_analysis",
        "gemini_recommendation",
        "created_at",
        "updated_at",
    )

    actions = [
        "verify_as_beginner",
        "verify_as_intermediate",
        "verify_as_expert",
        "reject_verification",
    ]

    # ---------- COLUMN UI ----------
    def admin_action(self, obj):
        if obj.verification_status == "Verified":
            return format_html("<span style='color:green;'>✔ Verified</span>")
        elif obj.verification_status == "Rejected":
            return format_html("<span style='color:red;'>✖ Rejected</span>")
        return format_html("<span style='color:orange;'>⏳ Pending</span>")

    admin_action.short_description = "Status"

    # ---------- ACTION LOGIC ----------
    def _verify(self, queryset, tag, rating):
        for verification in queryset:
            profile = verification.user.profile

            profile.tags = tag
            profile.star_rating = rating
            profile.save()

            verification.verification_status = "Verified"
            verification.save()

    def verify_as_beginner(self, request, queryset):
        self._verify(queryset, "Beginner", 3.0)

    def verify_as_intermediate(self, request, queryset):
        self._verify(queryset, "Intermediate", 4.0)

    def verify_as_expert(self, request, queryset):
        self._verify(queryset, "Expert", 5.0)

    def reject_verification(self, request, queryset):
        for verification in queryset:
            verification.verification_status = "Rejected"
            verification.save()

    verify_as_beginner.short_description = "✔ Verify as Beginner"
    verify_as_intermediate.short_description = "✔ Verify as Intermediate"
    verify_as_expert.short_description = "✔ Verify as Expert"
    reject_verification.short_description = "✖ Reject Verification"


@admin.register(SkillTest)
class SkillTestAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "created_at")
    search_fields = ("user__email",)


@admin.register(TestResult)
class TestResultAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "score", "percentage", "result", "created_at")
    list_filter = ("result",)
    search_fields = ("user__email",)
