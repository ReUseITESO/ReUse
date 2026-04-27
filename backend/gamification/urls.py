# Scaffolding: URL routes for the gamification module.
# Add your gamification endpoints here (points, badges, ranking, challenges).
# See docs/architecture/modules.md for the expected endpoint list.
# When ready, uncomment the path in config/urls.py to wire this in.
from django.urls import path

from gamification.views.avatar import AvatarDataView
from gamification.views.award_points import AwardPointsView
from gamification.views.badges import UserBadgesStatusView
from gamification.views.challenges import (
    ChallengeListView,
    ClaimChallengeRewardView,
    JoinChallengeView,
    MyChallengesView,
)
from gamification.views.deduct_points import DeductPointsView
from gamification.views.impact import UserImpactView
from gamification.views.point_history import PointsHistoryView
from gamification.views.points import (
    CurrentUserPointsView,
    CurrentUserLevelProgressionView,
    UserPointsView,
)

urlpatterns = [
    path("badges/status/", UserBadgesStatusView.as_view(), name="user-badges-status"),
    path("points/", CurrentUserPointsView.as_view(), name="current-user-points"),
    path("points/history/", PointsHistoryView.as_view(), name="points-history"),
    path("points/<int:user_id>/", UserPointsView.as_view(), name="user-points"),
    path(
        "level-progression/",
        CurrentUserLevelProgressionView.as_view(),
        name="current-user-level-progression",
    ),
    path("award-points/", AwardPointsView.as_view(), name="award-points"),
    path("deduct-points/", DeductPointsView.as_view(), name="deduct-points"),
    path("challenges/", ChallengeListView.as_view(), name="challenge-list"),
    path("challenges/me/", MyChallengesView.as_view(), name="my-challenges"),
    path(
        "challenges/<int:challenge_id>/join/",
        JoinChallengeView.as_view(),
        name="join-challenge",
    ),
    path(
        "challenges/<int:challenge_id>/claim/",
        ClaimChallengeRewardView.as_view(),
        name="claim-challenge-reward",
    ),
    path("impact/", UserImpactView.as_view(), name="user-impact"),
    path("avatar/data", AvatarDataView.as_view(), name="user-avatar-data"),
    # path("avatar/template/borders", DesignTemplateView.as_view(), name="avatar-design-borders"),
]
