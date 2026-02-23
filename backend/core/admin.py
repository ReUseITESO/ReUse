# Scaffolding: admin registration for core models.
# Customize list_display, search_fields, etc. as the User model evolves.
from django.contrib import admin

from core.models import User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ["id", "name", "email", "points", "created_at"]
    search_fields = ["name", "email"]
