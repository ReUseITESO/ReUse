from django.urls import path

from .views import (
    NotificationListView,
    NotificationMarkAllReadView,
    NotificationMarkReadView,
    NotificationUnreadCountView,
)

app_name = "notifications"

urlpatterns = [
    path("", NotificationListView.as_view(), name="list"),
    path("count/", NotificationUnreadCountView.as_view(), name="count"),
    path("<int:pk>/read/", NotificationMarkReadView.as_view(), name="mark-read"),
    path("read-all/", NotificationMarkAllReadView.as_view(), name="mark-all-read"),
]