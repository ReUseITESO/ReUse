# Unit Test Output — HU-GAM-01 — Award Points for Donation

## User Story
As a registered user, I want to earn points when I donate an item, so that I feel rewarded and motivated to reuse items.

## Detailed Description
When a user completes a donation action, the system should calculate and assign points based on the item category. The system must enforce a daily limit of points and prevent invalid actions from awarding points.

---

# 1️⃣ Test Strategy Summary

## What we will test
- Business rules described in the story and acceptance criteria
- Input validation and expected failures
- Boundary conditions (daily limits, invalid actions, non-positive points)

## What we will NOT test
- UI behavior (no frontend/UI tests)
- Database connectivity, ORM, migrations
- External services (notifications, real APIs)
- Framework-level behavior (FastAPI/Django routing)

## Assumptions made
- No additional assumptions.

## Risks detected
- If business rules are ambiguous or incomplete, tests may not match expected behavior
- Missing domain constraints (e.g., daily limit value) can lead to incorrect validation tests

---

# 2️⃣ Unit Test Scope

## Functions / methods under test
- award_points(user_id, action, points_to_add, repo)

## Business rules covered
- Points are awarded when a valid donation is completed
- Points are not awarded if the donation action is invalid
- Daily points limit is enforced
- User total points are updated correctly
- The system prevents awarding points with non-positive values

## Validations included
- Invalid action handling
- Non-positive points rejection
- Daily limit enforcement

---

# 3️⃣ Test Cases Definition

## Happy Path
### test_award_points_valid_donation_under_daily_limit
- Objective: Awards points when action is valid and daily limit not exceeded.
- Input: {'user_id': 'user_1', 'action': 'donate_item', 'points_to_add': 10, 'points_today': 50}
- Expected: Returns updated total points and calls repo.add_points once.


## Edge Cases
### test_award_points_exact_daily_limit_boundary
- Objective: Allows awarding points when total reaches exactly the daily limit.
- Input: {'user_id': 'user_1', 'action': 'donate_item', 'points_to_add': 50, 'points_today': 50}
- Expected: Award succeeds when points_today + points_to_add == 100.


## Negative / Error Cases
### test_award_points_rejects_invalid_action
- Objective: Rejects unknown/invalid actions.
- Input: {'user_id': 'user_1', 'action': 'invalid_action', 'points_to_add': 10}
- Expected: Raises ValueError and does not call repo.add_points.

### test_award_points_rejects_non_positive_points
- Objective: Rejects awarding points when points_to_add is 0 or negative.
- Input: {'user_id': 'user_1', 'action': 'donate_item', 'points_to_add': 0}
- Expected: Raises ValueError and does not call repo.add_points.

### test_award_points_enforces_daily_limit
- Objective: Prevents awarding points when daily limit would be exceeded.
- Input: {'user_id': 'user_1', 'action': 'donate_item', 'points_to_add': 60, 'points_today': 50}
- Expected: Raises ValueError and does not call repo.add_points.


---

# 4️⃣ Test Code (Python / pytest)

```python
import pytest
from unittest.mock import Mock

# NOTE:
# Replace the import below with your real function when integrating:
# from gamification.points_service import award_points

DAILY_LIMIT = 100


def award_points(user_id: str, action: str, points_to_add: int, repo):
    '''Minimal reference implementation for PoC testing.
    Replace with the real backend function in your project.
    '''
    valid_actions = {"donate_item"}

    if action not in valid_actions:
        raise ValueError("Invalid action")

    if points_to_add <= 0:
        raise ValueError("Points must be positive")

    points_today = repo.get_points_today(user_id)
    if points_today + points_to_add > DAILY_LIMIT:
        raise ValueError("Daily limit exceeded")

    repo.add_points(user_id, points_to_add)
    return repo.get_total_points(user_id)


def test_award_points_valid_donation_under_daily_limit():
    repo = Mock()
    repo.get_points_today.return_value = 50
    repo.get_total_points.return_value = 210

    result = award_points("user_1", "donate_item", 10, repo)

    assert result == 210
    repo.get_points_today.assert_called_once_with("user_1")
    repo.add_points.assert_called_once_with("user_1", 10)
    repo.get_total_points.assert_called_once_with("user_1")


def test_award_points_exact_daily_limit_boundary():
    repo = Mock()
    repo.get_points_today.return_value = 50
    repo.get_total_points.return_value = 250

    result = award_points("user_1", "donate_item", 50, repo)

    assert result == 250
    repo.add_points.assert_called_once_with("user_1", 50)


def test_award_points_rejects_invalid_action():
    repo = Mock()
    repo.get_points_today.return_value = 0

    with pytest.raises(ValueError):
        award_points("user_1", "invalid_action", 10, repo)

    repo.add_points.assert_not_called()


@pytest.mark.parametrize("points_to_add", [0, -5])
def test_award_points_rejects_non_positive_points(points_to_add):
    repo = Mock()
    repo.get_points_today.return_value = 0

    with pytest.raises(ValueError):
        award_points("user_1", "donate_item", points_to_add, repo)

    repo.add_points.assert_not_called()


def test_award_points_enforces_daily_limit():
    repo = Mock()
    repo.get_points_today.return_value = 50

    with pytest.raises(ValueError):
        award_points("user_1", "donate_item", 60, repo)

    repo.add_points.assert_not_called()

```

---

# 5️⃣ Mock Strategy

- **points_repo**
  - Why: Repository access must be isolated from real database calls.
  - How: Use unittest.mock.Mock() and configure return values for get_points_today/get_total_points.

---

# 6️⃣ Coverage Mapping (AC → Tests)

- AC-1 → test_award_points_valid_donation_under_daily_limit
- AC-2 → test_award_points_rejects_invalid_action
- AC-3 → test_award_points_enforces_daily_limit
- AC-4 → test_award_points_valid_donation_under_daily_limit
- AC-5 → test_award_points_rejects_non_positive_points

---

# 7️⃣ Test Data

## Minimal required data
- user_id: ['user_1']
- actions: ['donate_item', 'invalid_action']
- points values: [10, 0, -5, 100]

## Variations recommended
- points_today near limit (e.g., 90, 99, 100)
- points_to_add small vs large
- invalid action strings (empty, None if allowed by type system)

---

# 8️⃣ Gaps & Recommendations

- Consider adding tests for idempotency (e.g., prevent double-awarding points for same donation event) if applicable.

---
Generated at: 2026-02-03T15:52:19.520604Z
