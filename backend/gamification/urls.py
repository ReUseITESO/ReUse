# Scaffolding: URL routes for the gamification module.
# Add your gamification endpoints here (points, badges, ranking, challenges).
# See docs/architecture/modules.md for the expected endpoint list.
# When ready, uncomment the path in config/urls.py to wire this in.
from django.urls import path
from gamification.views.points import UserPointsView

urlpatterns = [
	path('points/<int:user_id>/', UserPointsView.as_view(), name='user-points'),
]
