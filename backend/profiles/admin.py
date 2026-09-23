from django.contrib import admin

from .models import ClientProfile, FreelancerProfile


@admin.register(ClientProfile)
class ClientProfileAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'user',
        'company_name',
        'location'
    ]


@admin.register(FreelancerProfile)
class FreelancerProfileAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'user',
        'headline',
        'location',
        'experience_years',
        'hourly_rate'
    ]