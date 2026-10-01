from django.contrib import admin

from .models import Skill, FreelancerSkill


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'name'
    ]
    search_fields = [
        'name'
    ]


@admin.register(FreelancerSkill)
class FreelancerSkillAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'freelancer',
        'skill'
    ]