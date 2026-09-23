from rest_framework import serializers
from .models import Skill, FreelancerSkill


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ["id", "name"]
        read_only_fields = ["id"]


class FreelancerSkillSerializer(serializers.ModelSerializer):
    skill_name = serializers.CharField(
        source="skill.name",
        read_only=True
    )

    new_skill_name = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=False
    )

    class Meta:
        model = FreelancerSkill
        fields = [
            "id",
            "skill",
            "skill_name",
            "new_skill_name",
        ]

        read_only_fields = [
            "id",
            "skill_name",
        ]

        extra_kwargs = {
            "skill": {
                "required": False,
                "allow_null": True,
            }
        }

    def validate(self, attrs):
        skill = attrs.get("skill")
        new_skill_name = attrs.get("new_skill_name")

        if not skill and not new_skill_name:
            raise serializers.ValidationError(
                "Select an existing skill or enter a new skill."
            )

        return attrs

    def create(self, validated_data):
        new_skill_name = validated_data.pop(
            "new_skill_name",
            None
        )

        if new_skill_name:
            skill_name = new_skill_name.strip()

            skill, created = Skill.objects.get_or_create(
                name=skill_name
            )

            validated_data["skill"] = skill

        return FreelancerSkill.objects.create(
            **validated_data
        )