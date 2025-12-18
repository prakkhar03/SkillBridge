from rest_framework import serializers
from accounts.models import User, Profile
from .models import FreelanceProject

class FreelancerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ["full_name", "location", "bio", "skills", "experience_level", "verification_tag", "star_rating"]

class DetailedApplicantSerializer(serializers.ModelSerializer):
    profile = FreelancerProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ["id", "email", "profile"]

class FreelanceProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = FreelanceProject
        fields = "__all__"
        read_only_fields = ["id", "created_by", "client_company", "created_at", "updated_at", "applicants"]
