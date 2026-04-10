# Migration 0003 — Agrega campos de desactivación lógica de cuenta (HU-CORE-17)
# is_deactivated: flag principal; deactivated_at: timestamp de la desactivación.
# No se elimina ningún registro — solo se cambia visibilidad lógica.

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("core", "0002_add_email_verification"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="is_deactivated",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="user",
            name="deactivated_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
