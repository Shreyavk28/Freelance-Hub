from rest_framework import serializers

from .models import Milestone


class MilestoneSerializer(serializers.ModelSerializer):

    project_title = serializers.CharField(
        source="project.title",
        read_only=True
    )

    class Meta:
        model = Milestone

        fields = [
            "id",
            "project",
            "project_title",
            "title",
            "description",
            "amount",
            "due_date",
            "status",
            "progress",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "project_title",
            "created_at",
            "updated_at",
        ]

    def validate_progress(self, value):

        if value < 0 or value > 100:
            raise serializers.ValidationError(
                "Progress must be between 0 and 100."
            )

        return value

    def validate_amount(self, value):

        if value <= 0:
            raise serializers.ValidationError(
                "Amount must be greater than zero."
            )

        return value