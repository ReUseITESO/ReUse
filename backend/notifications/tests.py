from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Notification

User = get_user_model()


def make_user(username="testuser", password="testpass123"):
    return User.objects.create_user(username=username, password=password, email=f"{username}@iteso.mx")


def make_notification(recipient, notification_type=Notification.NotificationType.SYSTEM, is_read=False):
    return Notification.objects.create(
        recipient=recipient,
        notification_type=notification_type,
        title="Test notification",
        message="This is a test.",
        is_read=is_read,
    )


class NotificationModelTest(APITestCase):
    def setUp(self):
        self.user = make_user()

    def test_notification_created_unread_by_default(self):
        n = make_notification(self.user)
        self.assertFalse(n.is_read)
        self.assertIsNone(n.read_at)

    def test_mark_as_read_sets_fields(self):
        n = make_notification(self.user)
        n.mark_as_read()
        self.assertTrue(n.is_read)
        self.assertIsNotNone(n.read_at)


class NotificationUnreadCountTest(APITestCase):
    def setUp(self):
        self.user = make_user("countuser")
        self.client.force_authenticate(user=self.user)
        self.url = reverse("notifications:unread-count")

    def test_unread_count_correct(self):
        make_notification(self.user, is_read=False)
        make_notification(self.user, is_read=False)
        make_notification(self.user, is_read=True)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["unread_count"], 2)


class NotificationMarkAllReadTest(APITestCase):
    def setUp(self):
        self.user = make_user("markalluser")
        self.client.force_authenticate(user=self.user)
        self.url = reverse("notifications:mark-all-read")

    def test_marks_all_unread_as_read(self):
        for _ in range(3):
            make_notification(self.user, is_read=False)
        response = self.client.post(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        remaining = Notification.objects.filter(recipient=self.user, is_read=False).count()
        self.assertEqual(remaining, 0)