from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from . import views

app_name = "auth"

urlpatterns = [
    path("signup/", views.SignUpView.as_view(), name="signup"),
    path("signin/", views.SignInView.as_view(), name="signin"),
    path("signout/", views.SignOutView.as_view(), name="signout"),
    path("refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("profile/", views.ProfileView.as_view(), name="profile"),

    # HU-CORE-09: Email verification module
    path(
        "email-verification/send/",
        views.EmailVerificationSendView.as_view(),
        name="email_verification_send",
    ),
    path(
        "email-verification/confirm/",
        views.EmailVerificationConfirmView.as_view(),
        name="email_verification_confirm",
    ),

    # HU-CORE-11: Friend system
    path("users/search/", views.UserSearchView.as_view(), name="user-search"),
    path("friends/", views.FriendsListView.as_view(), name="friends-list"),
    path("friends/request/", views.SendFriendRequestView.as_view(), name="send-friend-request"),
    path("friends/requests/", views.PendingFriendRequestsView.as_view(), name="pending-friend-requests"),
    path("friends/requests/<int:pk>/accept/", views.AcceptFriendRequestView.as_view(), name="accept-friend-request"),
    path("friends/requests/<int:pk>/reject/", views.RejectFriendRequestView.as_view(), name="reject-friend-request"),
    path("friends/<int:user_id>/", views.RemoveFriendView.as_view(), name="remove-friend"),
]
