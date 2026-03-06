from django.urls import path
from .views import (
    NotificationListView,
    NotificationDetailView,
    NotificationMarkReadView,
    NotificationMarkAllReadView,
    NotificationUnreadCountView,
)

app_name = "notifications"

urlpatterns = [
    path("", NotificationListView.as_view(), name="notification-list"),
    path("unread-count/", NotificationUnreadCountView.as_view(), name="unread-count"),
    path("mark-read/", NotificationMarkReadView.as_view(), name="mark-read"),
    path("mark-all-read/", NotificationMarkAllReadView.as_view(), name="mark-all-read"),
    path("<int:pk>/", NotificationDetailView.as_view(), name="notification-detail"),
]