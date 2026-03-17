# Scaffolding: import gamification models here after makemigrations.
# These models are defined in this directory as reference implementations
# based on docs/database/erd_v1.md. The team can modify them as needed.
#
from .badges import Badges
from .environment_impact import EnvironmentImpact
from .point_rule import PointAction, PointRule
from .point_transaction import PointTransaction
from .challenge import Challenge, ChallengeType
from .user_challenge import UserChallenge
from .user_badges import UserBadges

__all__ = [
    "Badges",
    "UserBadges",
    "EnvironmentImpact",
    "PointRule",
    "PointAction",
    "PointTransaction",
    "Challenge",
    "ChallengeType",
    "UserChallenge",
]
