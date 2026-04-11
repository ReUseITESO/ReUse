from django.db import transaction
from django.db.models import Q

from core.models.notification import Notification
from gamification.models.badges import Badges
from gamification.models.user_badges import UserBadges
from marketplace.models.product import Products
from marketplace.models.transaction import Transaction


def evaluate_milestones(user):
    """
    Evaluates user milestones based on metrics and awards badges if applicable.
    """
    # Prevent recursion if user.save() is called inside
    if getattr(user, "_is_evaluating_milestones", False):
        return []

    user._is_evaluating_milestones = True

    try:
        # Cache user earned badges
        earned_badges_ids = list(
            UserBadges.objects.filter(user=user).values_list("badges_id", flat=True)
        )

        new_badges_unlocked = []

        def check_and_award(badge_name, condition):
            if condition:
                # Try to get badge
                try:
                    badge = Badges.objects.get(name=badge_name)
                except Badges.DoesNotExist:
                    return  # If badge doesn't exist, ignore

                if badge.id not in earned_badges_ids:
                    earned_badges_ids.append(badge.id)
                    with transaction.atomic():
                        obj, created = UserBadges.objects.get_or_create(
                            user=user, badges=badge
                        )
                        if created:
                            # Add points if badge has them
                            if badge.points > 0:
                                user.points += badge.points
                                user.save(update_fields=["points"])

                            # Create Notification
                            Notification.objects.create(
                                user=user,
                                type="badge_earned",
                                title="¡Nuevo Badge Desbloqueado!",
                                body=f'¡Felicidades! Has obtenido el badge: "{badge.name}". {badge.description}',
                            )
                            new_badges_unlocked.append(badge)

        # Calculate metrics
        products_count = (
            Products.objects.filter(seller=user).exclude(status="cancelado").count()
        )
        libros_count = (
            Products.objects.filter(seller=user, category__name__icontains="libro")
            .exclude(status="cancelado")
            .count()
        )

        # Completed transactions where user is seller or buyer
        seller_txs = Transaction.objects.filter(seller=user, status="completada")
        buyer_txs = Transaction.objects.filter(buyer=user, status="completada")

        sales_count = seller_txs.filter(transaction_type="sale").count()
        donations_count = seller_txs.filter(transaction_type="donation").count()
        swap_count = Transaction.objects.filter(
            Q(seller=user) | Q(buyer=user), status="completada", transaction_type="swap"
        ).count()

        perfil_completo = bool(
            user.first_name and user.last_name and user.phone and user.profile_picture
        )

        check_and_award("Bienvenido a ReUse", True)
        check_and_award("Publicador Novato", products_count >= 1)
        check_and_award("Primera Venta", sales_count >= 1)
        check_and_award("Vendedor Top", sales_count >= 10)
        check_and_award("Comprador Estrella", buyer_txs.count() >= 5)
        check_and_award("Eco Warrior", donations_count >= 3)
        check_and_award("Trueque Master", swap_count >= 3)
        check_and_award("Librofilo", libros_count >= 5)
        check_and_award("Perfil Completo", perfil_completo)

        return new_badges_unlocked
    finally:
        user._is_evaluating_milestones = False
