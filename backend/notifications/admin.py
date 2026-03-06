from django.contrib import admin
from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "recipient",
        "notification_type",
        "title",
        "is_read",
        "created_at",
    ]
    list_filter = ["notification_type", "is_read", "created_at"]
    search_fields = ["recipient__username", "recipient__email", "title", "message"]
    readonly_fields = ["created_at", "read_at"]
    ordering = ["-created_at"]

    actions = ["mark_as_read"]

    @admin.action(description="Mark selected notifications as read")
    def mark_as_read(self, request, queryset):
        from django.utils import timezone
        updated = queryset.filter(is_read=False).update(is_read=True, read_at=timezone.now())
        self.message_user(request, f"{updated} notification(s) marked as read.")