from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone


class Report(models.Model):
    REASON_CHOICES = [
        ("prohibited_item", "Prohibited item"),
        ("misleading_description", "Misleading description"),
        ("offensive_content", "Offensive content"),
        ("possible_scam", "Possible scam"),
        ("other", "Other"),
    ]

    product = models.ForeignKey(
        "marketplace.Products",
        on_delete=models.CASCADE,
        related_name="reports",
    )
    reporter = models.ForeignKey(
        "core.User",
        on_delete=models.CASCADE,
        related_name="reports",
    )
    reason = models.CharField(max_length=30, choices=REASON_CHOICES)
    description = models.CharField(max_length=300, blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now, editable=False)

    class Meta:
        db_table = "marketplace_report"
        constraints = [
            models.UniqueConstraint(
                fields=["product", "reporter"],
                name="uq_report_product_reporter",
            )
        ]
        indexes = [
            models.Index(fields=["product"], name="idx_marketplace_report_product"),
            models.Index(fields=["reporter"], name="idx_report_reporter"),
        ]

    def clean(self):
        if (
            self.product_id
            and self.reporter_id
            and self.product.seller_id == self.reporter_id
        ):
            raise ValidationError("A user cannot report their own product.")

    def __str__(self):
        return f"Report by {self.reporter} on {self.product} ({self.reason})"
