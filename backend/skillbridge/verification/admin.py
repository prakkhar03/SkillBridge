from django.contrib import admin
from .models import SkillVerification, SkillTest, TestResult


@admin.register(SkillVerification)
class SkillVerificationAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "verification_status",
        "created_at",
    )
    list_filter = ("verification_status",)
    search_fields = ("user__email",)
    readonly_fields = ("gemini_recommendation", "resume_analysis", "github_analysis")


@admin.register(SkillTest)
class SkillTestAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "created_at")
    search_fields = ("user__email",)


@admin.register(TestResult)
class TestResultAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "score", "percentage", "result", "created_at")
    list_filter = ("result",)
    search_fields = ("user__email",)
