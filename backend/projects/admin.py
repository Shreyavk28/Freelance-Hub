from django.contrib import admin

from .models import Project


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = [
        'id',
        'title',
        'client',
        'budget_type',
        'budget_amount',
        'priority',
        'deadline',
        'status',
        'created_at',
    ]

    list_filter = [
        'budget_type',
        'priority',
        'status',
    ]

    search_fields = [
        'title',
        'description',
        'client__username',
    ]