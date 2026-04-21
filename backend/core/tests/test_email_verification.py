from django.contrib.auth import get_user_model
from django.core import mail
from django.test import TestCase

from core.views import send_verification_email


class EmailVerificationTests(TestCase):
    def test_send_verification_email_puts_message_in_outbox(self):
        user = get_user_model().objects.create_user(
            email="inaki.medina@iteso.mx", password="Daredev1l!", is_active=False
        )
        verify_url = "http://localhost:3001/auth/verify?token=abc"
        send_verification_email(user.email, verify_url)

        assert len(mail.outbox) == 1
        email = mail.outbox[0]
        assert "Verifica tu correo" in email.subject
        assert verify_url in email.body
        assert user.email in email.to
