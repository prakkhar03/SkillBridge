from rest_framework import serializers
from .models import FreelanceProject


class FreelanceProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = FreelanceProject
        fields = "__all__"
        read_only_fields = ["id", "created_by", "client_company", "created_at", "updated_at", "applicants"]
