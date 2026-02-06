# Mock & Test Data Agent Output Template

## 1. Summary
- **User Story Analyzed:** [Insert user story title or summary]
- **Artifacts Generated:** [List of generated artifacts: datasets, mocks, seeds, etc.]
- **Assumptions Made:**
  - [Explicitly list any assumptions or missing info]

---

## 2. Entities & Data Map
- **Entities Involved:** [e.g., User, Item, Transaction, Category]
- **Relevant Relationships:** [Describe relationships for testing]
- **Key Fields:** [List of fields required to validate acceptance criteria]

---

## 3. Test Data Sets
### Dataset A: Happy Path
```json
{
  // Minimal valid data for successful scenario
}
```
### Dataset B: Edge Cases
```json
{
  // Data for boundary conditions or unusual but valid cases
}
```
### Dataset C: Negative/Error Cases
```json
{
  // Data that should trigger errors or validation failures
}
```

---

## 4. Mock Definitions
### Mock Name: [Name]
- **Simulates:** [What does this mock simulate?]
- **Why Needed:** [Reason for the mock]
- **Response Format:**
```json
{
  // Example mock response
}
```
- **Variations:**
  - Success: [Example]
  - Error: [Example]
  - Timeout: [Example]

---

## 5. API Mock Payloads (if applicable)
### Example Request Payload
```json
{
  // Example request
}
```
### Example Response Payload
```json
{
  // Example response
}
```
### Common Errors
- 400: [Description]
- 401: [Description]
- 404: [Description]
- 409: [Description]
- 500: [Description]

---

## 6. Database Seeds (if applicable)
- **Entities:** [List]
- **Seed Data Example:**
```json
[
  // Example seed data
]
```
- **Integrity Notes:** [FKs, required fields, etc.]

---

## 7. Coverage Mapping (AC -> Data/Mocks)
| Acceptance Criteria | Dataset(s) | Mock(s) | Notes |
|---------------------|------------|---------|-------|
| AC-1                | A          | X       | ...   |
| AC-2                | B          |         | ...   |
| AC-3                | C          | Y       | ...   |

---

## 8. Risks & Gaps
- **Missing Fields:** [List]
- **Untestable Criteria:** [List]
- **Unclear Dependencies:** [List]
- **Recommendations:** [Suggestions to improve the user story]
