# Scaffolding: import gamification models here after makemigrations.
# These models are defined in this directory as reference implementations
# based on docs/database/erd_v1.md. The team can modify them as needed.
#
from .badges import Badges
from .user_badges import UserBadges
from .environment_impact import EnvironmentImpact
from .point_rule import PointRule, PointAction
from .point_transaction import PointTransaction
from .challenge import Challenge, ChallengeType
from .user_challenge import UserChallenge

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
