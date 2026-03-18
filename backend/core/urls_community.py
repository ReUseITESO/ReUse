"""URL routes for the community module (HU-CORE-13)."""

from django.urls import path

from core import views_community as views

urlpatterns = [
    path("", views.CommunityListCreateView.as_view(), name="community-list-create"),
    path("<int:pk>/", views.CommunityDetailView.as_view(), name="community-detail"),
    path("<int:pk>/members/", views.CommunityMembersView.as_view(), name="community-members"),
    path("<int:pk>/invite/", views.CommunityInviteView.as_view(), name="community-invite"),
    path("<int:pk>/join/", views.CommunityJoinView.as_view(), name="community-join"),
    path("<int:pk>/leave/", views.CommunityLeaveView.as_view(), name="community-leave"),
    path("<int:pk>/members/<int:user_id>/", views.CommunityExpelView.as_view(), name="community-expel"),
    path("<int:pk>/posts/", views.CommunityPostsView.as_view(), name="community-posts"),
    path("<int:pk>/posts/<int:post_id>/", views.CommunityPostDetailView.as_view(), name="community-post-detail"),
    path("invitations/", views.MyInvitationsView.as_view(), name="my-invitations"),
]
