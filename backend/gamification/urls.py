# Scaffolding: URL routes for the gamification module.
# Add your gamification endpoints here (points, badges, ranking, challenges).
# See docs/architecture/modules.md for the expected endpoint list.
# When ready, uncomment the path in config/urls.py to wire this in.
from django.urls import path

from gamification.views.award_points import AwardPointsView
from gamification.views.deduct_points import DeductPointsView

urlpatterns = [
    path("award-points/", AwardPointsView.as_view(), name="award-points"),
    path("deduct-points/", DeductPointsView.as_view(), name="deduct-points"),
]