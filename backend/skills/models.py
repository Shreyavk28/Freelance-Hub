from django.conf import settings
from django.db import models


class Skill(models.Model):
    name = models.CharField(
        max_length=100,
        unique=True
    )

    def __str__(self):
        return self.name


class FreelancerSkill(models.Model):
    freelancer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='freelancer_skills'
    )
    skill = models.ForeignKey(
        Skill,
        on_delete=models.CASCADE,
        related_name='freelancers'
    )

    class Meta:
        unique_together = ('freelancer', 'skill')

    def __str__(self):
        return f"{self.freelancer.username} - {self.skill.name}"