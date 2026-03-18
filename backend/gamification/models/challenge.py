from django.core.validators import MinValueValidator
from django.db import models


class ChallengeType(models.TextChoices):
    DONATION = "donation", "Donation"
    EXCHANGE = "exchange", "Exchange"
    SALE = "sale", "Sale"
    PUBLISH = "publish", "Publish"
    REVIEW = "review", "Review"


class Challenge(models.Model):
    title = models.CharField(max_length=120)
    description = models.TextField()
    challenge_type = models.CharField(max_length=20, choices=ChallengeType.choices)
    goal = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    bonus_points = models.PositiveIntegerField(default=0)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["start_date", "id"]

    def __str__(self):
        return self.title
