# Migration 0004 — Crea tabla account_reactivation_tokens (HU-CORE-17)
# Permite enviar un email con link para reactivar una cuenta desactivada.

import django.db.models.deletion
import django.utils.timezone
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0003_user_deactivation"),
    ]

    operations = [
        migrations.CreateModel(
            name="AccountReactivationToken",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("token_hash", models.CharField(max_length=64, unique=True)),
                ("expires_at", models.DateTimeField()),
                ("used_at", models.DateTimeField(blank=True, null=True)),
                (
                    "created_at",
                    models.DateTimeField(
                        auto_now_add=True,
                        default=django.utils.timezone.now,
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="reactivation_tokens",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "db_table": "account_reactivation_tokens",
            },
        ),
        migrations.AddIndex(
            model_name="accountreactivationtoken",
            index=models.Index(
                fields=["user"], name="acct_react_user_id_idx"
            ),
        ),
        migrations.AddIndex(
            model_name="accountreactivationtoken",
            index=models.Index(
                fields=["token_hash"], name="acct_react_token_hash_idx"
            ),
        ),
        migrations.AddIndex(
            model_name="accountreactivationtoken",
            index=models.Index(
                fields=["expires_at"], name="acct_react_expires_at_idx"
            ),
        ),
    ]
