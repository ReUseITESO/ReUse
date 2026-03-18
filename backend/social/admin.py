from django.contrib import admin

from social.models import (
    Community,
    CommunityMember,
    CommunityPost,
    FrequentContact,
    UserConnection,
)


@admin.register(UserConnection)
class UserConnectionAdmin(admin.ModelAdmin):
    list_display = ["id", "requester", "addressee", "status", "created_at", "updated_at"]
    list_filter = ["status"]
    search_fields = ["requester__email", "addressee__email"]


@admin.register(FrequentContact)
class FrequentContactAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "contact", "created_at"]
    search_fields = ["user__email", "contact__email"]


class CommunityMemberInline(admin.TabularInline):
    model = CommunityMember
    extra = 0
    autocomplete_fields = ["user"]


@admin.register(Community)
class CommunityAdmin(admin.ModelAdmin):
    list_display = ["id", "name", "creator", "is_private", "is_active", "created_at"]
    list_filter = ["is_private", "is_active"]
    search_fields = ["name", "creator__email"]
    inlines = [CommunityMemberInline]


@admin.register(CommunityMember)
class CommunityMemberAdmin(admin.ModelAdmin):
    list_display = ["id", "community", "user", "role", "joined_at"]
    list_filter = ["role"]
    search_fields = ["community__name", "user__email"]

@admin.register(CommunityPost)
class CommunityPostAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "community", "user", "is_pinned", "created_at")
    list_filter = ("community", "is_pinned", "created_at")
    search_fields = ("title", "content", "user__email", "community__name")
