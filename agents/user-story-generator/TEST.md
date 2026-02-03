# 🧪 Testing the User Story Generator Agent

## Quick Test

Run this command to verify the agent works:

```bash
python3 src/generator.py --example
```

Expected output: A complete user story in markdown format.

---

## Test Cases

### Test 1: Generate Example Story

```bash
python3 src/generator.py --example
```

**Expected:** Story with all 9 required sections.

### Test 2: Interactive Mode

```bash
python3 src/generator.py --interactive
```

**Input:**
- Title: `User can view notifications`
- Domain: `Core`
- Description: `Users want to see their notifications in real-time`

**Expected:** Complete story generated interactively.

### Test 3: Generate from JSON File

```bash
python3 src/generator.py \
  --input examples/input-example.json \
  --output test-output.md
```

**Expected:** File `test-output.md` created with valid story.

### Test 4: Validate Generated Story

```bash
python3 src/generator.py --example > test-story.md
python3 src/validate_story.py test-story.md
```

**Expected:** Validation passes with no errors.

### Test 5: Duplication Detection

```bash
python3 src/generator.py \
  --input examples/input-example.json \
  --existing-stories examples/existing-stories.json \
  --output test-with-deps.md
```

**Expected:** Story includes dependency analysis.

### Test 6: Complex Story

```bash
python3 src/generator.py \
  --input examples/complex-input.json \
  --output complex-story.md
```

**Expected:** Story with multiple dependencies identified.

---

## Validation Tests

### Test Valid Story

```bash
python3 src/validate_story.py examples/output-example.md
```

**Expected:** ✅ Story is valid

### Test Invalid Story (Missing Sections)

Create a file `invalid-story.md`:

```markdown
# Test Story

## User Story
As a user, I want something.

## Acceptance Criteria
- [ ] It works
```

Run:

```bash
python3 src/validate_story.py invalid-story.md
```

**Expected:** ❌ Multiple errors about missing sections

---

## Integration Tests

### Test with Real Project Structure

1. Create a backlog file:

```bash
mkdir -p ../../docs/backlog
cp examples/existing-stories.json ../../docs/backlog/stories.json
```

2. Generate story:

```bash
python3 src/generator.py \
  --title "User can edit their profile" \
  --domain "Core" \
  --description "Users want to update their profile information" \
  --existing-stories ../../docs/backlog/stories.json
```

**Expected:** Story with dependency on US-002 (User profile management)

---

## Performance Tests

### Test with Large Story List

Create a file with 100 stories and test duplication detection:

```bash
# Generate 100 fake stories
python3 -c "
import json
stories = [
    {'id': f'US-{i:03d}', 'title': f'Story {i}', 'domain': 'Core'}
    for i in range(100)
]
with open('large-stories.json', 'w') as f:
    json.dump(stories, f)
"

# Test generation
time python3 src/generator.py \
  --title "User can do something" \
  --domain "Core" \
  --description "Test story" \
  --existing-stories large-stories.json
```

**Expected:** Completes in < 2 seconds

---

## Edge Cases

### Test 1: Very Long Title

```bash
python3 src/generator.py \
  --title "User can perform a very complex action that involves multiple steps and requires coordination between different systems and services" \
  --domain "Core" \
  --description "Test"
```

**Expected:** Warning about title length

### Test 2: Empty Description

```bash
python3 src/generator.py \
  --title "Test" \
  --domain "Core" \
  --description ""
```

**Expected:** Error about missing description

### Test 3: Invalid Domain

```bash
python3 src/generator.py \
  --title "Test" \
  --domain "InvalidDomain" \
  --description "Test description"
```

**Expected:** Story generated with domain = None

---

## Cleanup

Remove test files:

```bash
rm -f test-output.md test-story.md test-with-deps.md complex-story.md invalid-story.md large-stories.json
```

---

## Automated Test Suite (Future)

To create automated tests, add `tests/` directory:

```
tests/
├── test_generator.py
├── test_validators.py
├── test_models.py
└── test_integration.py
```

Run with:

```bash
pytest tests/
```

---

## Success Criteria

All tests should:
- ✅ Complete without errors
- ✅ Generate valid markdown
- ✅ Pass validation
- ✅ Identify dependencies correctly
- ✅ Detect duplicates when present
- ✅ Handle edge cases gracefully
