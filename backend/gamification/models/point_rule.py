from django.db import models


class PointAction(models.TextChoices):
    PUBLISH_ITEM = 'publish_item', 'Publish item'
    COMPLETE_DONATION = 'complete_donation', 'Complete donation'
    COMPLETE_SALE = 'complete_sale', 'Complete sale'
    COMPLETE_EXCHANGE = 'complete_exchange', 'Complete exchange'
    RECEIVE_POSITIVE_REVIEW = 'receive_positive_review', 'Receive positive review'


class PointRule(models.Model):
    action = models.CharField(max_length=50, choices=PointAction.choices, unique=True)
    points = models.IntegerField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['action']

    def __str__(self):
        return f'{self.action} - {self.points}'