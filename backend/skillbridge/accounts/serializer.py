from rest_framework import serializers
from django.contrib.auth import authenticate, get_user_model
from .models import Profile
from django.contrib.auth.hashers import check_password

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["email", "password", "confirm_password", "role"]

    def validate(self, attrs):
        email = attrs.get('email', '').lower()
        password = attrs.get('password')
        confirm_password = attrs.get('confirm_password')

        # Email required
        if not email:
            raise serializers.ValidationError({"email": "Email is required"})

        # Email already taken
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError({"email": "Email already registered"})

        # Passwords must match
        if password != confirm_password:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match"})

        return attrs

    def create(self, validated_data):
        validated_data.pop("confirm_password")  
        password = validated_data.pop("password")
        user = User.objects.create_user(password=password, **validated_data)
        Profile.objects.create(user=user)
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        # Authenticate the user using email and password
        email = data.get('email', '').lower()
        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            raise serializers.ValidationError('Invalid email or password')
        
        
        if not check_password(data['password'], user.password):
            raise serializers.ValidationError('Invalid email or password')
             
        if user.is_active:
            self.context['user'] = user
            return data
        
        raise serializers.ValidationError('User account is disabled')
class UserDataSerializer(serializers.ModelSerializer):
    profile = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "email", "role", "verified", "onboarding_stage", "is_active", "date_joined", "profile"]

    def get_profile(self, obj):
        try:
            profile = obj.profile
            return {
                "full_name": profile.full_name,
                "location": profile.location,
                "bio": profile.bio,
                "skills": profile.skills,
                "experience_level": profile.experience_level,
                "portfolio_links": profile.portfolio_links,
                "verification_tag": profile.verification_tag,
                "star_rating": profile.star_rating,
                "github_url": profile.github_url,
                "resume": profile.resume.url if profile.resume else None
            }
        except Profile.DoesNotExist:
            return None


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = [
            "full_name",
            "location",
            "bio",
            "skills",
            "experience_level",
            "portfolio_links",
            "github_url",
            "resume"
        ]
        extra_kwargs = {
            "full_name": {"required": False, "allow_blank": True},
            "location": {"required": False, "allow_blank": True},
            "bio": {"required": False, "allow_blank": True},
            "skills": {"required": False, "allow_blank": True},
            "experience_level": {"required": False, "allow_blank": True},
            "portfolio_links": {"required": False, "allow_blank": True},
            "github_url": {"required": False, "allow_blank": True},
            "resume": {"required": False, "allow_null": True}
        }

    def update(self, instance, validated_data):
      
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
