from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone


class SwapTransaction(models.Model):
    """Extended state machine for swap-type transactions."""

    class Stage(models.TextChoices):
        PROPOSAL_PENDING = "proposal_pending", "Proposal Pending"
        PROPOSAL_REJECTED = "proposal_rejected", "Proposal Rejected"
        PROPOSAL_ACCEPTED = "proposal_accepted", "Proposal Accepted"
        AGENDA_PENDING = "agenda_pending", "Agenda Pending"
        AGENDA_REJECTED = "agenda_rejected", "Agenda Rejected"
        AGENDA_ACCEPTED = "agenda_accepted", "Agenda Accepted"

    transaction = models.OneToOneField(
        "marketplace.Transaction",
        on_delete=models.CASCADE,
        related_name="swap_data",
    )
    proposed_product = models.ForeignKey(
        "marketplace.Products",
        on_delete=models.RESTRICT,
        related_name="swap_proposals",
    )
    stage = models.CharField(
        max_length=30,
        choices=Stage.choices,
        default=Stage.PROPOSAL_PENDING,
    )
    agenda_location = models.CharField(max_length=255, null=True, blank=True)
    proposal_decided_at = models.DateTimeField(null=True, blank=True)
    agenda_decided_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now, editable=False)
    updated_at = models.DateTimeField(default=timezone.now)

    class Meta:
        indexes = [
            models.Index(fields=["transaction"]),
            models.Index(fields=["proposed_product"]),
            models.Index(fields=["stage"]),
            models.Index(fields=["stage", "created_at"]),
        ]

    def save(self, *args, **kwargs):
        if not self._state.adding:
            self.updated_at = timezone.now()
        super().save(*args, **kwargs)

    def clean(self):
        if (
            self.proposed_product_id
            and self.transaction_id
            and self.proposed_product_id == self.transaction.products_id
        ):
            raise ValidationError(
                "proposed_product cannot be the same product as the transaction product."
            )

    def __str__(self) -> str:
        return f"SwapTransaction #{self.pk} — {self.stage}"
