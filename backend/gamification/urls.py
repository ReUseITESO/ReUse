# Scaffolding: URL routes for the gamification module.
# Add your gamification endpoints here (points, badges, ranking, challenges).
# See docs/architecture/modules.md for the expected endpoint list.
# When ready, uncomment the path in config/urls.py to wire this in.
from django.urls import path
from .views.badges import UserBadgesStatusView


urlpatterns = [
    path('badges/status/', UserBadgesStatusView.as_view(), name='user-badges-status'),
 
    ]