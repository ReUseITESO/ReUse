from __future__ import annotations

from dataclasses import asdict, dataclass


@dataclass(frozen=True)
class LevelDefinition:
    name: str
    min_points: int
    icon: str


LEVELS: tuple[LevelDefinition, ...] = (
    LevelDefinition(name="Beginner Reuser", min_points=0, icon="seed"),
    LevelDefinition(name="Active Reuser", min_points=100, icon="leaf"),
    LevelDefinition(name="Eco Champion", min_points=250, icon="trophy"),
    LevelDefinition(name="Sustainability Leader", min_points=500, icon="crown"),
)


def _resolve_current_level(points: int) -> tuple[int, LevelDefinition]:
    current_idx = 0
    for idx, level in enumerate(LEVELS):
        if points >= level.min_points:
            current_idx = idx
        else:
            break
    return current_idx, LEVELS[current_idx]


def _calculate_progress_percent(points: int, current_idx: int) -> int:
    if current_idx == len(LEVELS) - 1:
        return 100

    current_level = LEVELS[current_idx]
    next_level = LEVELS[current_idx + 1]
    span = next_level.min_points - current_level.min_points
    progressed = max(points - current_level.min_points, 0)

    if span <= 0:
        return 100

    return min(int((progressed / span) * 100), 100)


def build_level_progression(points: int) -> dict:
    safe_points = max(points, 0)
    current_idx, current_level = _resolve_current_level(safe_points)
    is_max_level = current_idx == len(LEVELS) - 1
    next_level = None if is_max_level else LEVELS[current_idx + 1]
    points_to_next_level = 0 if is_max_level else max(next_level.min_points - safe_points, 0)

    return {
        "points": safe_points,
        "current_level": asdict(current_level),
        "next_level": asdict(next_level) if next_level else None,
        "progress_percent": _calculate_progress_percent(safe_points, current_idx),
        "points_to_next_level": points_to_next_level,
        "is_max_level": is_max_level,
    }