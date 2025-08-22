from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email required")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """
        Create a superuser (admin) with full permissions
        and skip email verification.
        """
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("verified", True)  
        extra_fields.setdefault("role", "admin")   
        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(email, password, **extra_fields)



#freelancer and client user model

class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = (
        ("freelancer", "Freelancer"),
        ("client", "Client"),
        ("admin", "Admin"),
    )

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    verified = models.BooleanField(default=False)
    onboarding_stage = models.IntegerField(default=0)  # 0=Registered, 1=Verified, 2=Profile, 3=Skills Test Done

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_working = models.BooleanField(default=False)  # For freelancers
    date_joined = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["role"]

    def __str__(self):
        return self.email



class Profile(models.Model):
    TAG_CHOICES = (
        ("Unverified", "Unverified"),
        ("Beginner", "Beginner"),
        ("Intermediate", "Intermediate"),
        ("Expert", "Expert"),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    full_name = models.CharField(max_length=255, blank=True)
    location = models.CharField(max_length=255, blank=True)
    bio = models.TextField(blank=True)
    skills = models.TextField(blank=True)
    experience_level = models.CharField(max_length=50, blank=True)
    portfolio_links = models.TextField(blank=True)
    github_url = models.URLField(blank=True, null=True)
    resume = models.FileField(upload_to="resumes/", blank=True, null=True)  # PDF/DOCX 

    verification_tag = models.CharField(max_length=20, choices=TAG_CHOICES, default="Unverified")
    star_rating = models.DecimalField(max_digits=2, decimal_places=1, default=0.0)  

    def __str__(self):
        return f"{self.user.email} Profile"

class ClientCompany(models.Model):
    ONBOARDING_STAGES = (
        (0, "Registered"),
        (1, "Basic Info Completed"),
        (2, "Documents Submitted"),
        (3, "Verification Completed"),
        (4, "Onboarding Done"),
    )

    # Link to User model (must have role = client)
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="client_company",
        limit_choices_to={"role": "client"}
    )

    company_name = models.CharField(max_length=255)
    industry = models.CharField(max_length=255, blank=True)
    website = models.URLField(blank=True, null=True)
    address = models.TextField(blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    
    onboarding_stage = models.IntegerField(choices=ONBOARDING_STAGES, default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.company_name


class ClientDocument(models.Model):
    client_company = models.ForeignKey(ClientCompany, on_delete=models.CASCADE, related_name="documents")
    document_type = models.CharField(max_length=100)  # GST, PAN, Incorporation Certificate, etc.
    file = models.FileField(upload_to="client_docs/")
    verified = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.client_company.company_name} - {self.document_type}"


class ClientContact(models.Model):
    client_company = models.ForeignKey(ClientCompany, on_delete=models.CASCADE, related_name="contacts")
    full_name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    designation = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"{self.full_name} ({self.client_company.company_name})"
