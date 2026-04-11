from django.urls import path

from . import views_notifications

app_name = "notifications"

urlpatterns = [
    path("", views_notifications.NotificationListView.as_view(), name="notifications-list"),
    path("count/", views_notifications.NotificationCountView.as_view(), name="notifications-count"),
    path("<int:pk>/read/", views_notifications.NotificationMarkReadView.as_view(), name="notifications-read"),
    path("read-all/", views_notifications.NotificationMarkAllReadView.as_view(), name="notifications-read-all"),
]