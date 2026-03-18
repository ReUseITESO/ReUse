from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="Community",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=100)),
                ("description", models.TextField()),
                ("icon", models.CharField(blank=True, max_length=500, null=True)),
                ("is_private", models.BooleanField(default=False)),
                ("is_active", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(default=django.utils.timezone.now, editable=False)),
                ("updated_at", models.DateTimeField(default=django.utils.timezone.now)),
                ("creator", models.ForeignKey(db_column="creator_id", on_delete=django.db.models.deletion.RESTRICT, related_name="created_communities", to=settings.AUTH_USER_MODEL)),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
        migrations.CreateModel(
            name="FrequentContact",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(default=django.utils.timezone.now, editable=False)),
                ("contact", models.ForeignKey(db_column="contact_id", on_delete=django.db.models.deletion.CASCADE, related_name="marked_as_frequent_by", to=settings.AUTH_USER_MODEL)),
                ("user", models.ForeignKey(db_column="user_id", on_delete=django.db.models.deletion.CASCADE, related_name="frequent_contacts", to=settings.AUTH_USER_MODEL)),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
        migrations.CreateModel(
            name="UserConnection",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("status", models.CharField(choices=[("pending", "Pending"), ("accepted", "Accepted"), ("rejected", "Rejected"), ("blocked", "Blocked")], default="pending", max_length=20)),
                ("created_at", models.DateTimeField(default=django.utils.timezone.now, editable=False)),
                ("updated_at", models.DateTimeField(default=django.utils.timezone.now)),
                ("addressee", models.ForeignKey(db_column="addressee_id", on_delete=django.db.models.deletion.CASCADE, related_name="received_connections", to=settings.AUTH_USER_MODEL)),
                ("requester", models.ForeignKey(db_column="requester_id", on_delete=django.db.models.deletion.CASCADE, related_name="sent_connections", to=settings.AUTH_USER_MODEL)),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
        migrations.CreateModel(
            name="CommunityMember",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("role", models.CharField(choices=[("admin", "Admin"), ("moderator", "Moderator"), ("member", "Member")], default="member", max_length=20)),
                ("joined_at", models.DateTimeField(default=django.utils.timezone.now, editable=False)),
                ("community", models.ForeignKey(db_column="community_id", on_delete=django.db.models.deletion.CASCADE, related_name="memberships", to="social.community")),
                ("user", models.ForeignKey(db_column="user_id", on_delete=django.db.models.deletion.CASCADE, related_name="community_memberships", to=settings.AUTH_USER_MODEL)),
            ],
            options={
                "ordering": ["-joined_at"],
            },
        ),
        migrations.AddIndex(
            model_name="community",
            index=models.Index(fields=["creator"], name="social_comm_creator__067820_idx"),
        ),
        migrations.AddIndex(
            model_name="community",
            index=models.Index(fields=["is_active"], name="social_comm_is_acti_603e93_idx"),
        ),
        migrations.AddIndex(
            model_name="frequentcontact",
            index=models.Index(fields=["user"], name="social_freq_user_id_373984_idx"),
        ),
        migrations.AddConstraint(
            model_name="frequentcontact",
            constraint=models.UniqueConstraint(fields=("user", "contact"), name="unique_social_frequent_contact"),
        ),
        migrations.AddConstraint(
            model_name="frequentcontact",
            constraint=models.CheckConstraint(check=models.Q(("user", models.F("contact")), _negated=True), name="social_frequentcontact_user_not_contact"),
        ),
        migrations.AddIndex(
            model_name="userconnection",
            index=models.Index(fields=["requester"], name="social_user_request_c41b9d_idx"),
        ),
        migrations.AddIndex(
            model_name="userconnection",
            index=models.Index(fields=["addressee"], name="social_user_addres_9d2fd3_idx"),
        ),
        migrations.AddIndex(
            model_name="userconnection",
            index=models.Index(fields=["addressee", "status"], name="social_user_addres_116204_idx"),
        ),
        migrations.AddConstraint(
            model_name="userconnection",
            constraint=models.UniqueConstraint(fields=("requester", "addressee"), name="unique_social_connection_direction"),
        ),
        migrations.AddConstraint(
            model_name="userconnection",
            constraint=models.CheckConstraint(check=models.Q(("requester", models.F("addressee")), _negated=True), name="social_userconnection_requester_not_addressee"),
        ),
        migrations.AddIndex(
            model_name="communitymember",
            index=models.Index(fields=["community"], name="social_comm_community_72f282_idx"),
        ),
        migrations.AddIndex(
            model_name="communitymember",
            index=models.Index(fields=["user"], name="social_comm_user_id_1e2f77_idx"),
        ),
        migrations.AddIndex(
            model_name="communitymember",
            index=models.Index(fields=["community", "role"], name="social_comm_community_2af0ca_idx"),
        ),
        migrations.AddConstraint(
            model_name="communitymember",
            constraint=models.UniqueConstraint(fields=("community", "user"), name="unique_social_community_member"),
        ),
    ]
