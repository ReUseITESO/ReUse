from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from core.models import User

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ["id", "name", "email", "points", "date_joined"]
    search_fields = ["name", "email"]
    ordering = ["-date_joined"]