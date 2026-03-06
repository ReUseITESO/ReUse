from django.db import models


class PointTransaction(models.Model):
    user = models.ForeignKey(
        'core.User',
        on_delete=models.CASCADE,
        related_name='point_transactions',
    )
    action = models.CharField(max_length=50)
    points = models.IntegerField()
    reference_id = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user.email} - {self.action} - {self.points}'