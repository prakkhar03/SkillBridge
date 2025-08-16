from django.db import models
from django.conf import settings


class SkillVerification(models.Model):
    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("VERIFIED", "Verified"),
        ("REJECTED", "Rejected"),
    ]

    user = models.ForeignKey( 
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="verification"
    )

    resume_analysis = models.TextField(blank=True)
    github_analysis = models.TextField(blank=True)
    gemini_recommendation = models.JSONField(blank=True, null=True)

    verification_status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="PENDING"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Verification({self.user.email}) - {self.verification_status}"
    
class SkillTest(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="skill_tests"
    )
    questions = models.JSONField()
    answers = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"SkillTest({self.user.email}) - {self.created_at.strftime('%Y-%m-%d %H:%M:%S')}"
    