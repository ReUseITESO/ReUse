from django.db import models
from django.core.exceptions import ValidationError
from .category import Category


class Products(models.Model):
    """Productos publicados en el marketplace"""
    
    CONDITION_CHOICES = [
        ('nuevo', 'Nuevo'),
        ('como_nuevo', 'Como Nuevo'),
        ('buen_estado', 'Buen Estado'),
        ('usado', 'Usado'),
    ]
    
    TRANSACTION_TYPE_CHOICES = [
        ('donation', 'Donación'),
        ('sale', 'Venta'),
        ('swap', 'Intercambio'),
    ]
    
    STATUS_CHOICES = [
        ('disponible', 'Disponible'),
        ('en_proceso', 'En Proceso'),
        ('completado', 'Completado'),
        ('cancelado', 'Cancelado'),
    ]
    
    # TODO: Cuando el equipo de Core implemente su módulo, cambiar a 'core.User'
    seller = models.ForeignKey(
        'core.User',
        on_delete=models.RESTRICT,
        related_name='products_selling',
        db_column='seller_id'
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.RESTRICT,
        related_name='products',
        db_column='category_id'
    )
    title = models.CharField(max_length=255)
    description = models.TextField()
    condition = models.CharField(max_length=20, choices=CONDITION_CHOICES)
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='disponible')
    price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    image_url = models.CharField(max_length=500, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'products'
        verbose_name_plural = 'Products'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['seller']),
            models.Index(fields=['category']),
            models.Index(fields=['status']),
            models.Index(fields=['status', 'category'], name='idx_products_available'),
        ]
    
    def clean(self):
        if self.transaction_type == 'donation' and self.price is not None:
            raise ValidationError('Las donaciones no deben tener precio')
        
        if self.transaction_type == 'sale' and (self.price is None or self.price <= 0):
            raise ValidationError('Las ventas deben tener un precio mayor a 0')
    
    def __str__(self):
        return self.title