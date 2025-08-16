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
