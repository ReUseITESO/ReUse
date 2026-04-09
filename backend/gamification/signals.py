from django.db.models.signals import post_save
from django.dispatch import receiver

from core.models.user import User
from marketplace.models.product import Products
from marketplace.models.transaction import Transaction
from gamification.services.badge_service import evaluate_milestones

@receiver(post_save, sender=Products)
def product_post_save(sender, instance, created, **kwargs):
    evaluate_milestones(instance.seller)

@receiver(post_save, sender=Transaction)
def transaction_post_save(sender, instance, created, **kwargs):
    if instance.status == "completada":
        evaluate_milestones(instance.seller)
        evaluate_milestones(instance.buyer)

@receiver(post_save, sender=User)
def user_post_save(sender, instance, created, **kwargs):
    evaluate_milestones(instance)
