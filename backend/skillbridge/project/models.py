import uuid
from django.db import models
from django.conf import settings
from accounts.models import ClientCompany

class FreelanceProject(models.Model):
    PROJECT_TYPE_CHOICES = [
        ("fixed", "Fixed Price"),
        ("hourly", "Hourly"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    client_company = models.ForeignKey(
        ClientCompany,
        on_delete=models.CASCADE,
        related_name="freelance_projects"
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="posted_projects",
        limit_choices_to={"role": "client"}
    )

    title = models.CharField(max_length=255)
    description = models.TextField()
    skills_required = models.TextField(help_text="Comma-separated list of required skills")
    budget = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    project_type = models.CharField(max_length=20, choices=PROJECT_TYPE_CHOICES, default="fixed")
    is_open = models.BooleanField(default=True)
    applicants = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name="applied_projects",
        blank=True,
        limit_choices_to={"role": "freelancer"}
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.client_company.company_name})"
