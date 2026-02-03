import argparse
import json
import os
from datetime import datetime
from typing import Dict, List, Any


def safe_get(d: Dict[str, Any], key: str, default):
    value = d.get(key, default)
    return value if value is not None else default


def build_assumptions(payload: dict) -> List[str]:
    """Build a list of explicit assumptions when required info is missing."""
    assumptions: List[str] = []

    backend_details = safe_get(payload.get("implementation_details", {}), "backend", [])
    backend_text = (
        " ".join(backend_details).lower()
        if isinstance(backend_details, list)
        else str(backend_details).lower()
    )

    if "function under test" not in backend_text:
        assumptions.append(
            "No explicit function under test provided. Assuming a service function like `award_points(...)` exists."
        )

    if not payload.get("dependencies"):
        assumptions.append("No dependencies listed. Assuming pure logic with no external calls.")

    if not payload.get("potential_mocks"):
        assumptions.append(
            "No potential mocks listed. Assuming repository/service mocks may still be needed."
        )

    if not payload.get("acceptance_criteria"):
        assumptions.append(
            "No acceptance criteria provided. Tests are generated from description and general validation rules."
        )

    return assumptions


def infer_functions_under_test(payload: dict) -> List[str]:
    """Infer functions/methods under test from implementation details (PoC inference)."""
    backend = payload.get("implementation_details", {}).get("backend", [])
    functions: List[str] = []

    # Try to find lines like: "Function under test: xyz(...)"
    if isinstance(backend, list):
        for line in backend:
            if "Function under test:" in line:
                fn = line.split("Function under test:")[-1].strip()
                if fn:
                    functions.append(fn)

    if not functions:
        # Default PoC assumption
        functions.append("award_points(user_id, action, points_to_add, repo)")

    return functions


def generate_test_cases(payload: dict) -> Dict[str, List[dict]]:
    """Generate grouped test cases (happy path, edge cases, negative/error cases)."""

    # For PoC, we generate a robust set for a points-awarding story.
    # If the story differs, it still serves as a strong template.

    happy = [
        {
            "name": "test_award_points_valid_donation_under_daily_limit",
            "objective": "Awards points when action is valid and daily limit not exceeded.",
            "input": {
                "user_id": "user_1",
                "action": "donate_item",
                "points_to_add": 10,
                "points_today": 50,
            },
            "expected": "Returns updated total points and calls repo.add_points once.",
        }
    ]

    edge = [
        {
            "name": "test_award_points_exact_daily_limit_boundary",
            "objective": "Allows awarding points when total reaches exactly the daily limit.",
            "input": {
                "user_id": "user_1",
                "action": "donate_item",
                "points_to_add": 50,
                "points_today": 50,
            },
            "expected": "Award succeeds when points_today + points_to_add == 100.",
        }
    ]

    negative = [
        {
            "name": "test_award_points_rejects_invalid_action",
            "objective": "Rejects unknown/invalid actions.",
            "input": {"user_id": "user_1", "action": "invalid_action", "points_to_add": 10},
            "expected": "Raises ValueError and does not call repo.add_points.",
        },
        {
            "name": "test_award_points_rejects_non_positive_points",
            "objective": "Rejects awarding points when points_to_add is 0 or negative.",
            "input": {"user_id": "user_1", "action": "donate_item", "points_to_add": 0},
            "expected": "Raises ValueError and does not call repo.add_points.",
        },
        {
            "name": "test_award_points_enforces_daily_limit",
            "objective": "Prevents awarding points when daily limit would be exceeded.",
            "input": {
                "user_id": "user_1",
                "action": "donate_item",
                "points_to_add": 60,
                "points_today": 50,
            },
            "expected": "Raises ValueError and does not call repo.add_points.",
        },
    ]

    return {
        "happy_path": happy,
        "edge_cases": edge,
        "negative_cases": negative,
    }


def build_ac_mapping(payload: dict) -> Dict[str, str]:
    """Map Acceptance Criteria (AC checklist items) to generated test names."""
    ac_list = payload.get("acceptance_criteria", [])
    mapping: Dict[str, str] = {}

    # Default mapping order for PoC
    default_map = [
        "test_award_points_valid_donation_under_daily_limit",
        "test_award_points_rejects_invalid_action",
        "test_award_points_enforces_daily_limit",
        "test_award_points_valid_donation_under_daily_limit",
        "test_award_points_rejects_non_positive_points",
    ]

    for i, _ac in enumerate(ac_list):
        key = f"AC-{i+1}"
        mapping[key] = default_map[i] if i < len(default_map) else "test_todo_add_more_coverage"

    return mapping


def generate_mock_strategy(payload: dict) -> List[dict]:
    """Define what to mock, why, and how."""
    mocks = payload.get("potential_mocks", []) or payload.get("dependencies", [])
    result: List[dict] = []

    if "points_repo" in mocks or "points_repo" in (payload.get("dependencies") or []):
        result.append(
            {
                "mock": "points_repo",
                "why": "Repository access must be isolated from real database calls.",
                "how": "Use unittest.mock.Mock() and configure return values for get_points_today/get_total_points.",
            }
        )

    if not result:
        result.append(
            {
                "mock": "N/A",
                "why": "No external dependencies identified.",
                "how": "Tests run using pure inputs without mocks.",
            }
        )

    return result


def generate_pytest_code() -> str:
    """Generate pytest code that is runnable as a PoC and easily integrable."""

    # NOTE: This includes a minimal reference implementation (award_points)
    # so the generated tests are not empty/trivial.
    # In real integration, replace award_points with actual project function import.

    return """import pytest
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
"""


def build_output_markdown(payload: dict) -> str:
    title = payload.get("title", "Untitled User Story")
    user_story = payload.get("user_story", "")
    description = payload.get("detailed_description", "")
    acceptance_criteria = payload.get("acceptance_criteria", [])

    assumptions = build_assumptions(payload)
    functions_under_test = infer_functions_under_test(payload)
    test_cases = generate_test_cases(payload)
    ac_map = build_ac_mapping(payload)
    mock_strategy = generate_mock_strategy(payload)

    test_data = payload.get("test_data_required", {})

    gaps: List[str] = []
    if not acceptance_criteria:
        gaps.append("Acceptance criteria missing: add checklist ACs to improve test mapping.")

    if "repo" not in " ".join(functions_under_test).lower():
        gaps.append(
            "Dependency injection not explicit: recommend passing repositories/services as parameters for testability."
        )

    gaps.append(
        "Consider adding tests for idempotency (e.g., prevent double-awarding points for same donation event) if applicable."
    )
    
    happy_md = chr(10).join([
        "### {}\n- Objective: {}\n- Input: {}\n- Expected: {}\n".format(
            t["name"], t["objective"], t["input"], t["expected"]
        )
        for t in test_cases["happy_path"]
    ])

    edge_md = chr(10).join([
        "### {}\n- Objective: {}\n- Input: {}\n- Expected: {}\n".format(
            t["name"], t["objective"], t["input"], t["expected"]
        )
        for t in test_cases["edge_cases"]
    ])

    negative_md = chr(10).join([
        "### {}\n- Objective: {}\n- Input: {}\n- Expected: {}\n".format(
            t["name"], t["objective"], t["input"], t["expected"]
        )
        for t in test_cases["negative_cases"]
    ])
    
    assumptions_md = chr(10).join(f"- {a}" for a in assumptions) or "- No additional assumptions."

    functions_md = chr(10).join(f"- {fn}" for fn in functions_under_test)

    ac_md = (
        chr(10).join(f"- {ac}" for ac in acceptance_criteria)
        if acceptance_criteria
        else "- Derived from description + standard validations"
    )

    mock_md = chr(10).join(
        "- **{}**\n  - Why: {}\n  - How: {}".format(m["mock"], m["why"], m["how"])
        for m in mock_strategy
    )

    ac_map_md = (
        chr(10).join(f"- {k} → {v}" for k, v in ac_map.items())
        if ac_map
        else "- No acceptance criteria provided to map."
    )

    gaps_md = chr(10).join(f"- {g}" for g in gaps)

    md = f"""# Unit Test Output — {title}

## User Story
{user_story}

## Detailed Description
{description}

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
{assumptions_md}

## Risks detected
- If business rules are ambiguous or incomplete, tests may not match expected behavior
- Missing domain constraints (e.g., daily limit value) can lead to incorrect validation tests

---

# 2️⃣ Unit Test Scope

## Functions / methods under test
{functions_md}

## Business rules covered
{chr(10).join([f"- {ac}" for ac in acceptance_criteria]) if acceptance_criteria else "- Derived from description + standard validations"}

## Validations included
- Invalid action handling
- Non-positive points rejection
- Daily limit enforcement

---

# 3️⃣ Test Cases Definition

## Happy Path
{happy_md}

## Edge Cases
{edge_md}

## Negative / Error Cases
{negative_md}

---

# 4️⃣ Test Code (Python / pytest)

```python
{generate_pytest_code()}
```

---

# 5️⃣ Mock Strategy

{mock_md}

---

# 6️⃣ Coverage Mapping (AC → Tests)

{ac_map_md}

---

# 7️⃣ Test Data

## Minimal required data
- user_id: {test_data.get('user_ids', ['user_1'])}
- actions: {test_data.get('actions', ['donate_item', 'invalid_action'])}
- points values: {test_data.get('points_values', [10, 0, -5, 50, 60])}

## Variations recommended
- points_today near limit (e.g., 90, 99, 100)
- points_to_add small vs large
- invalid action strings (empty, None if allowed by type system)

---

# 8️⃣ Gaps & Recommendations

{gaps_md}

---
Generated at: {datetime.utcnow().isoformat()}Z
"""

    return md


def main():
    parser = argparse.ArgumentParser(description="Unit Test Generator Agent (Gamification)")
    parser.add_argument("--input", required=True, help="Path to input JSON user story")
    parser.add_argument("--output", required=True, help="Path to output markdown file")
    args = parser.parse_args()

    with open(args.input, "r", encoding="utf-8") as f:
        payload = json.load(f)

    output_md = build_output_markdown(payload)

    os.makedirs(os.path.dirname(args.output) or ".", exist_ok=True)
    with open(args.output, "w", encoding="utf-8") as f:
        f.write(output_md)

    print(f"✅ Generated unit test plan + code: {args.output}")


if __name__ == "__main__":
    main()
