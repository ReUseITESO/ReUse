from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from core.models import User
from core.models.notification import Notification


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ["id", "email", "first_name", "last_name", "points", "date_joined"]
    search_fields = ["email", "first_name", "last_name"]
    ordering = ["-date_joined"]
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        (
            "Info personal",
            {"fields": ("first_name", "last_name", "phone", "profile_picture")},
        ),
        (
            "Permisos",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        ("Gamificación", {"fields": ("points",)}),
        ("Fechas", {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "email",
                    "first_name",
                    "last_name",
                    "password1",
                    "password2",
                ),
            },
        ),
    )


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "type", "title", "is_read", "created_at"]
    list_filter = ["type", "is_read"]
    search_fields = ["user__email", "title"]
    ordering = ["-created_at"]
