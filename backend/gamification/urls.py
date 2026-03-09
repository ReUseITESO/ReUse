# Scaffolding: URL routes for the gamification module.
# Add your gamification endpoints here (points, badges, ranking, challenges).
# See docs/architecture/modules.md for the expected endpoint list.
# When ready, uncomment the path in config/urls.py to wire this in.
from django.urls import path

from gamification.views.award_points import AwardPointsView
from gamification.views.badges import UserBadgesStatusView
from gamification.views.deduct_points import DeductPointsView
from gamification.views.points import CurrentUserPointsView, UserPointsView


urlpatterns = [
    path('badges/status/', UserBadgesStatusView.as_view(), name='user-badges-status'),
    path('points/', CurrentUserPointsView.as_view(), name='current-user-points'),
    path('points/<int:user_id>/', UserPointsView.as_view(), name='user-points'),
    path("award-points/", AwardPointsView.as_view(), name="award-points"),
    path("deduct-points/", DeductPointsView.as_view(), name="deduct-points"),
]
