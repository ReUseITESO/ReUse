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

    # User search (used by friends and communities)
    path("users/search/", views.UserSearchView.as_view(), name="user-search"),

    # HU-CORE-04: Dashboard
    path("dashboard/", views.DashboardView.as_view(), name="dashboard"),

    # HU-CORE-10: Profile picture upload
    path("profile/upload-picture/", views.ProfilePictureUploadView.as_view(), name="profile-upload-picture"),

    # HU-CORE-12: Share item with friends
    path("shares/", views.ShareItemView.as_view(), name="share-item"),
]
