# Mock & Test Data Agent - Technical Architecture

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Data Flow](#data-flow)
3. [Module Reference](#module-reference)
4. [Function Documentation](#function-documentation)
5. [Domain-Specific Generation](#domain-specific-generation)
6. [Extension Guide](#extension-guide)

---

## Architecture Overview

The Mock & Test Data Agent follows a **modular pipeline architecture** with four main components:

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   main.py   │ ───> │  parser.py  │ ───> │generator.py │ ───> │output_      │
│   (CLI)     │      │  (Extract)  │      │  (Generate) │      │builder.py   │
│             │      │             │      │             │      │  (Format)   │
└─────────────┘      └─────────────┘      └─────────────┘      └─────────────┘
     Input              Sections            Test Data            Markdown
   (User Story)         (Dict)              (Objects)            (Output)
```

### Design Principles

1. **Separation of Concerns**: Each module has a single responsibility
2. **Domain Awareness**: Detects and adapts to different project modules (Marketplace, Core, Gamification)
3. **Graceful Degradation**: Continues execution even with missing information
4. **Explicit Assumptions**: Documents all assumptions and gaps
5. **Reusable Output**: Generates JSON data ready for copy-paste into tests

---

## Data Flow

### 1. Input Phase (`main.py`)
- Receives user story markdown file path
- Validates file existence
- Creates output directory if needed
- Coordinates the pipeline

### 2. Parsing Phase (`parser.py`)
- Extracts structured sections from markdown
- Supports English and Spanish (Descripcion Detallada) section titles
- Identifies missing required sections
- Returns dictionary with all sections (present or None)

### 3. Generation Phase (`generator.py`)
- **Domain Detection**: Determines module (marketplace/core/gamification/generic)
- **Entity Analysis**: Extracts entities and relationships
- **Dataset Generation**: Creates happy path, edge cases, and negative cases
- **Mock Creation**: Generates mock definitions per domain
- **Payload Building**: Creates API request/response examples
- **Seed Generation**: Produces database seed data

### 4. Output Phase (`output_builder.py`)
- Formats all generated data into markdown
- Structures output in 8 required sections
- Applies consistent formatting (UTF-8, proper indentation)
- Writes final markdown file

---

## Module Reference

### `main.py` - Entry Point and CLI

**Purpose**: Command-line interface and pipeline orchestration

**Key Responsibilities**:
- Argument parsing
- File I/O operations
- Error handling and user feedback
- Progress reporting

**Main Function**: `main()`
- Validates input file
- Creates output directory
- Orchestrates parser → generator → builder pipeline
- Displays summary statistics

**Usage Pattern**:
```python
python src/main.py <input_file> [output_filename]
```

---

### `parser.py` - User Story Parser

**Purpose**: Extract structured data from markdown user stories

**Class**: `UserStoryParser`

**Key Responsibilities**:
- Parse markdown headers and sections
- Extract checklists (Acceptance Criteria)
- Parse implementation details (Backend/Frontend/Database)
- Support bilingual sections (English/Spanish)
- Track missing sections

**Core Methods**:

#### `parse() -> Dict[str, Any]`
Main parsing method that orchestrates all extraction operations.

**Returns**: Dictionary with keys:
- `title`: Story title (H1)
- `domain`: Module identifier (marketplace/core/gamification)
- `user_story`: User story text
- `description`: Detailed description (English or Spanish)
- `acceptance_criteria`: List of criteria
- `implementation_details`: Dict with backend/frontend/database
- `testing_notes`: Testing guidance
- `test_data_required`: Required test data description
- `potential_mocks`: Mock descriptions
- `dependencies`: Dependency information
- `assumptions`: Explicit assumptions
- `missing_sections`: List of missing section names

#### `_extract_title() -> str`
Extracts the first H1 heading as the story title.

#### `_extract_domain() -> str`
Looks for a "Domain" section to identify the module (marketplace/core/gamification).

#### `_extract_section(section_name: str) -> str`
Generic section extractor that finds H2 sections by name.

**Supports multiple variations**:
- "Detailed Description", "Description", "Descripción detallada" → `description`

#### `_extract_checklist(section_name: str) -> List[str]`
Extracts bullet points or checkboxes from a section (used for Acceptance Criteria).

#### `_extract_implementation_details() -> Dict[str, str]`
Parses the Implementation Details section into structured components:
- `backend`: Backend implementation notes
- `frontend`: Frontend implementation notes
- `database`: Database schema/table information

#### `_identify_missing_sections() -> List[str]`
Compares expected sections against parsed data and identifies gaps.

**Expected sections**:
- title, user_story, description, acceptance_criteria, implementation_details, testing_notes

---

### `generator.py` - Test Data Generator

**Purpose**: Generate realistic test data, mocks, and seeds based on domain

**Class**: `TestDataGenerator`

**Key Responsibilities**:
- Domain detection and contextualization
- Entity and relationship extraction
- Dataset generation (happy path, edge cases, negative cases)
- Mock definition creation
- API payload examples
- Database seed data
- Coverage mapping
- Gap identification

**Attributes**:
- `sections`: Parsed user story sections
- `domain`: Detected domain (marketplace/core/gamification/generic)
- `entities`: List of identified entities
- `relationships`: List of entity relationships
- `key_fields`: List of (field_name, field_type) tuples
- `assumptions`: List of explicit assumptions made

---

### Core Functions

#### `__init__(sections: Dict[str, Any])`
Initializes generator with parsed sections and detects domain.

**Initialization order**:
1. Store sections
2. Initialize empty lists (entities, relationships, key_fields, assumptions)
3. Call `_extract_domain()` to determine module context

#### `_extract_domain() -> str`
**Purpose**: Detect the module/domain from user story

**Detection logic**:
1. Check for explicit "Domain" section
2. Normalize to lowercase
3. Match keywords:
   - "market" → `marketplace`
   - "core", "auth" → `core`
   - "gamif", "point", "achievement" → `gamification`
4. If no match, add assumption and return `generic`

**Returns**: String domain identifier

---

### Entity Analysis Functions

#### `analyze_entities() -> Dict[str, Any]`
**Purpose**: Extract entities, relationships, and key fields from database schema

**Process**:
1. Get database schema from implementation details
2. Extract entities from "TABLE" or "table:" mentions
3. Infer key fields from schema description
4. Identify relationships from foreign key mentions

**Returns**: Dictionary with:
- `entities`: List of entity names
- `relationships`: List of relationship descriptions
- `key_fields`: List of (field, type) tuples

#### `_extract_entities_from_schema(schema: str) -> List[str]`
Uses regex to find table names in schema text.

**Pattern**: Matches "TABLE table_name" or "table: table_name"

#### `_extract_key_fields(schema: str) -> List[Tuple[str, str]]`
Extracts field definitions from schema.

**Pattern**: Looks for "field_name: type" or "field_name (type)"

---

### Dataset Generation Functions

#### `generate_datasets() -> Dict[str, Any]`
**Purpose**: Generate three types of test datasets

**Calls domain-specific generators**:
- `_generate_marketplace_datasets()` for marketplace domain
- `_generate_core_datasets()` for core domain  
- `_generate_gamification_datasets()` for gamification domain
- `_generate_generic_datasets()` for unknown domains

**Returns**: Dictionary with:
- `happy_path`: Valid data (JSON object)
- `edge_cases`: Boundary conditions (JSON object)
- `negative_cases`: Invalid data (List of test cases)

#### `_generate_marketplace_datasets() -> Dict[str, Any]`
**Domain**: Marketplace (items, donations, categories)

**Happy Path**: Complete item with all fields
- UUID, user_id, title, description
- category, condition, status
- images array, timestamps

**Edge Cases**:
- Very long titles/descriptions
- Maximum image count
- Special characters in text
- Reserved status

**Negative Cases**:
- Missing required fields (title, category)
- Invalid category
- Empty images array
- Future timestamps

#### `_generate_core_datasets() -> Dict[str, Any]`
**Domain**: Core (authentication, users)

**Happy Path**: Valid user with institutional credentials
- UUID, institutional email (@iteso.mx)
- 6-digit institutional_id (e.g., "123456")
- Spanish names with proper UTF-8 (María, José)
- Student role, active status

**Edge Cases**:
- Very long names
- Staff role
- Maximum institutional_id (999999)
- Never logged in (null last_login)

**Negative Cases**:
- Non-institutional email domain
- Missing required fields
- Invalid role
- Duplicate institutional_id

#### `_generate_gamification_datasets() -> Dict[str, Any]`
**Domain**: Gamification (points, achievements)

**Happy Path**: Point award record
- UUID, user_id, points awarded
- Action type, achievement reference
- CO2 savings calculation
- Description of earning reason

**Edge Cases**:
- Large point values (100+)
- Challenge completion
- Achievement unlock
- High CO2 savings

**Negative Cases**:
- Negative points
- Missing user_id
- Invalid action type
- Non-existent achievement_id

#### `_generate_generic_datasets() -> Dict[str, Any]`
**Domain**: Generic (fallback)

**Happy Path**: Basic resource with common fields
- UUID, status, timestamps

**Edge Cases**: Minimal variations

**Negative Cases**: Basic validation failures

---

### Mock Generation Functions

#### `generate_mocks() -> List[Dict[str, Any]]`
**Purpose**: Generate mock definitions based on domain and dependencies

**Process**:
1. Extract backend and potential_mocks from sections
2. Route to domain-specific mock generator
3. Add generic mocks if needed

**Returns**: List of mock definition dictionaries, each containing:
- `name`: Mock class name
- `simulates`: What it mocks
- `why_needed`: Testing justification
- `response_format`: Success and error responses
- `variations`: List of response types

#### `_generate_marketplace_mocks(backend: str) -> List[Dict[str, Any]]`
**Domain**: Marketplace

**Generated mocks**:
1. **ItemRepositoryMock**: Database operations for items
2. **ImageUploadServiceMock**: Image upload and storage
3. **CategoryServiceMock**: Category validation

#### `_generate_core_mocks(backend: str) -> List[Dict[str, Any]]`
**Domain**: Core

**Generated mocks**:
1. **InstitutionalAuthServiceMock**: ITESO authentication
   - Validates @iteso.mx emails
   - Returns 6-digit institutional_id
   - Includes role information
2. **EmailVerificationServiceMock**: Email sending
   - Confirmation emails
   - Token generation

#### `_generate_gamification_mocks(backend: str) -> List[Dict[str, Any]]`
**Domain**: Gamification

**Generated mocks**:
1. **PointsServiceMock**: Point calculation and awarding
2. **AchievementServiceMock**: Achievement unlock logic
3. **LeaderboardServiceMock**: Ranking calculations

#### `_generate_generic_mocks(backend: str, potential_mocks: str) -> List[Dict[str, Any]]`
**Domain**: Generic (fallback)

**Generated mocks**:
1. **AuthenticationServiceMock**: Generic auth
2. **DatabaseMock**: Generic database operations

---

### API Payload Functions

#### `generate_api_payloads() -> Dict[str, Any]`
**Purpose**: Generate example API request/response payloads

**Process**:
1. Extract endpoint from backend details
2. Generate request body using `_generate_happy_path()`
3. Create response examples for status codes:
   - 201: Success
   - 400: Bad Request (validation)
   - 401: Unauthorized
   - 409: Conflict (duplicate)
   - 500: Internal Server Error

**Returns**: Dictionary with:
- `endpoint`: API endpoint path
- `method`: HTTP method (POST)
- `request`: Request payload with headers and body
- `responses`: Dictionary of status code → response objects

---

### Database Seed Functions

#### `generate_seeds() -> Dict[str, Any]`
**Purpose**: Generate database seed data

**Process**:
1. Route to domain-specific seed generator
2. Include integrity notes per entity

**Returns**: Dictionary with:
- `entities`: List of entity names
- `data`: List of seed data objects per entity

#### `_generate_marketplace_seeds() -> List[Dict[str, Any]]`
**Domain**: Marketplace

**Entities**:
1. **items**: Sample items with varied conditions/statuses
2. **categories**: Common item categories

**Integrity notes**:
- user_id foreign key constraints
- category enum validation
- condition/status enums

#### `_generate_core_seeds() -> List[Dict[str, Any]]`
**Domain**: Core

**Entities**:
1. **users**: Students, staff, admin with 6-digit IDs
2. **sessions**: Active JWT tokens

**Integrity notes**:
- Email must be @iteso.mx
- 6-digit institutional_id format
- Role validation

#### `_generate_gamification_seeds() -> List[Dict[str, Any]]`
**Domain**: Gamification

**Entities**:
1. **user_points**: Point balances and levels
2. **achievements**: Available achievements
3. **user_achievements**: Unlocked achievements

**Integrity notes**:
- Points must be non-negative
- Level calculation rules
- Achievement unlock constraints

#### `_generate_generic_seeds() -> List[Dict[str, Any]]`
**Domain**: Generic

**Entities**:
1. **resources**: Basic entity template

---

### Coverage and Analysis Functions

#### `map_coverage() -> List[Dict[str, Any]]`
**Purpose**: Map acceptance criteria to datasets and mocks

**Process**:
1. Iterate through acceptance criteria
2. Analyze keywords to determine needed artifacts:
   - "access", "form" → Happy Path
   - "required", "validation" → Happy Path + Negative Cases
   - "success", "message" → Happy Path + DatabaseMock
   - "redirect" → Happy Path with notes
   - "error" → Negative Cases + DatabaseMock
3. Add notes for testing guidance

**Returns**: List of mapping objects with:
- `criteria`: Criterion identifier (AC-1, AC-2, ...)
- `description`: Criterion text
- `datasets`: Required dataset names
- `mocks`: Required mock names
- `notes`: Testing guidance

#### `identify_risks_and_gaps() -> Dict[str, List[str]]`
**Purpose**: Identify missing information and risks

**Checks**:
1. Missing domain (recommends specifying)
2. Missing implementation details sections
3. Vague acceptance criteria (too short)
4. Missing dependencies
5. Missing test data requirements
6. Missing mock identification

**Returns**: Dictionary with:
- `missing_fields`: Required sections not found
- `untestable_criteria`: Criteria that are too vague
- `unclear_dependencies`: Dependency issues
- `recommendations`: Improvement suggestions

---

### Helper Functions

#### `_extract_required_fields(backend: str) -> Dict[str, str]`
Extracts field names and types from backend description using regex.

#### `_generate_happy_path(fields: Dict[str, str]) -> Dict[str, Any]`
Generates realistic values for extracted fields based on field names and types.

---

## `output_builder.py` - Output Formatter

**Purpose**: Format all generated data into structured markdown

**Class**: `OutputBuilder`

**Key Responsibilities**:
- Build 8-section markdown output
- Format JSON with UTF-8 support (no escaped characters)
- Create tables for coverage mapping
- Organize output in consistent structure

**Attributes**:
- `sections`: Parsed user story sections
- `generator`: TestDataGenerator instance
- `output_lines`: List of markdown lines being built

---

### Output Functions

#### `build() -> str`
**Purpose**: Orchestrate building of complete output

**Process** (calls in order):
1. `_add_header()` - Title and metadata
2. `_add_summary()` - Overview with domain, artifacts, assumptions
3. `_add_entities_and_data_map()` - Entity analysis results
4. `_add_test_datasets()` - Three dataset types in JSON
5. `_add_mock_definitions()` - Mock specifications
6. `_add_api_payloads()` - Request/response examples
7. `_add_database_seeds()` - Seed data per entity
8. `_add_coverage_mapping()` - AC mapping table
9. `_add_risks_and_gaps()` - Issues and recommendations

**Returns**: Complete markdown string

#### `_add_summary()`
**Section 1**: Summary

**Includes**:
- User story title
- **Domain detected** (new feature)
- Artifacts generated list
- Assumptions made (if any)
- Missing information (if any)

#### `_add_entities_and_data_map()`
**Section 2**: Entities & Data Map

**Includes**:
- Entities involved
- Relationships
- Key fields

#### `_add_test_datasets()`
**Section 3**: Test Data Sets

**Includes**:
- Dataset A: Happy Path (JSON with `ensure_ascii=False`)
- Dataset B: Edge Cases (JSON with `ensure_ascii=False`)
- Dataset C: Negative Cases (JSON with `ensure_ascii=False`)

**Important**: Uses `json.dumps(data, indent=2, ensure_ascii=False)` to properly display UTF-8 characters (tildes, ñ, etc.)

#### `_add_mock_definitions()`
**Section 4**: Mock Definitions

**Includes**: For each mock:
- Name
- What it simulates
- Why needed
- Response format (JSON with `ensure_ascii=False`)
- Variations

#### `_add_api_payloads()`
**Section 5**: API Mock Payloads

**Includes**:
- Endpoint and method
- Example request payload
- Response payloads per status code (201, 400, 401, 409, 500)

#### `_add_database_seeds()`
**Section 6**: Database Seeds

**Includes**:
- Entity list
- Seed data per entity (JSON with `ensure_ascii=False`)
- **Integrity notes per entity** (new feature)

#### `_add_coverage_mapping()`
**Section 7**: Coverage Mapping

**Format**: Markdown table with columns:
- Acceptance Criteria (with description)
- Dataset(s)
- Mock(s)
- Notes

#### `_add_risks_and_gaps()`
**Section 8**: Risks & Gaps

**Includes**:
- Missing Fields
- Untestable Criteria
- Unclear Dependencies
- **Recommendations** (includes domain recommendation if missing)

---

## Domain-Specific Generation

### Why Domain Awareness?

The ReUseITESO project has three distinct modules with different data characteristics:

1. **Marketplace**: Items, donations, categories
2. **Core**: Users, authentication, institutional data
3. **Gamification**: Points, achievements, leaderboards

Generic test data doesn't capture the nuances of each module. Domain-aware generation ensures realistic, contextually appropriate test data.

### How Domain Detection Works

#### Explicit Domain
User story includes a "Domain" section:
```markdown
## Domain
Marketplace
```

#### Keyword Detection
Parser looks for keywords in the user story:
- "market", "item", "donation" → Marketplace
- "core", "auth", "user", "login" → Core
- "gamif", "point", "achievement", "level" → Gamification

#### Fallback to Generic
If no domain detected, uses generic generation and recommends adding domain specification.

### Domain-Specific Data Characteristics

#### Marketplace Data
```json
{
  "title": "Calculadora Científica Casio FX-991",
  "description": "En excelente estado, ideal para ingeniería",
  "category": "school_supplies",
  "condition": "like_new",
  "status": "published",
  "images": ["https://storage.reuseiteso.mx/items/calc001.jpg"]
}
```

**Characteristics**:
- Spanish titles and descriptions
- Item-specific categories
- Condition states (like_new, good, fair, for_parts)
- Publication status workflow
- Image URLs

#### Core Data
```json
{
  "email": "estudiante.test@iteso.mx",
  "full_name": "María González López",
  "institutional_id": "123456",
  "role": "student"
}
```

**Characteristics**:
- @iteso.mx email addresses
- Spanish names with proper UTF-8 (María, José)
- **6-digit institutional_id** (not 9)
- ITESO-specific roles (student, staff, admin)

#### Gamification Data
```json
{
  "user_id": "...",
  "points": 10,
  "action": "item_published",
  "description": "Points awarded for publishing first item",
  "co2_saved_kg": 0.5
}
```

**Characteristics**:
- Point values tied to actions
- Achievement unlocking
- Environmental impact (CO2 savings)
- Level progression

---

## Extension Guide

### Adding a New Domain

To add support for a new domain (e.g., "Notifications"):

#### 1. Update Domain Detection (`generator.py`)

```python
def _extract_domain(self) -> str:
    # ... existing code ...
    elif 'notif' in domain or 'message' in domain:
        return 'notifications'
```

#### 2. Create Domain-Specific Dataset Generator

```python
def _generate_notifications_datasets(self) -> Dict[str, Any]:
    happy_path = {
        'id': str(uuid4()),
        'user_id': str(uuid4()),
        'type': 'email',
        'subject': 'Item Reservation Confirmed',
        'message': 'Your reservation has been confirmed.',
        'status': 'sent',
        'sent_at': datetime.now().isoformat()
    }
    
    edge_cases = {
        # ... edge case data ...
    }
    
    negative_cases = [
        # ... error cases ...
    ]
    
    return {
        'happy_path': happy_path,
        'edge_cases': edge_cases,
        'negative_cases': negative_cases
    }
```

#### 3. Create Domain-Specific Mock Generator

```python
def _generate_notifications_mocks(self, backend: str) -> List[Dict[str, Any]]:
    mocks = []
    
    # Email service mock
    mocks.append({
        'name': 'EmailServiceMock',
        'simulates': 'Email notification sending',
        'why_needed': 'Test notifications without sending real emails',
        'response_format': {
            'success': {'sent': True, 'message_id': str(uuid4())},
            'error': {'sent': False, 'error': 'SMTP connection failed'}
        },
        'variations': ['success', 'smtp_error', 'invalid_recipient']
    })
    
    return mocks
```

#### 4. Create Domain-Specific Seed Generator

```python
def _generate_notifications_seeds(self) -> List[Dict[str, Any]]:
    return [
        {
            'entity': 'notifications',
            'records': [
                {
                    'id': str(uuid4()),
                    'user_id': str(uuid4()),
                    'type': 'email',
                    'subject': 'Welcome to ReUseITESO',
                    'status': 'sent',
                    'sent_at': datetime.now().isoformat()
                }
            ],
            'integrity_notes': [
                'user_id must reference existing user',
                'type must be one of: email, sms, push',
                'status must be one of: pending, sent, failed'
            ]
        }
    ]
```

#### 5. Update Routing Functions

```python
def generate_datasets(self) -> Dict[str, Any]:
    if self.domain == 'marketplace':
        return self._generate_marketplace_datasets()
    elif self.domain == 'core':
        return self._generate_core_datasets()
    elif self.domain == 'gamification':
        return self._generate_gamification_datasets()
    elif self.domain == 'notifications':  # NEW
        return self._generate_notifications_datasets()
    else:
        return self._generate_generic_datasets()
```

Repeat for `generate_mocks()` and `generate_seeds()`.

### Adding a New Output Section

To add a new section (e.g., "9. Performance Considerations"):

#### 1. Create Builder Method (`output_builder.py`)

```python
def _add_performance_considerations(self):
    """Add performance considerations section."""
    self.output_lines.extend([
        '## 9. Performance Considerations',
        '',
        '### Load Testing Requirements',
        '- Concurrent users: 100+',
        '- Response time: < 200ms',
        '',
        '### Optimization Notes',
        '- Index on user_id and created_at fields',
        '- Cache frequently accessed categories',
        '',
        '---',
        ''
    ])
```

#### 2. Update Build Sequence (`output_builder.py`)

```python
def build(self) -> str:
    self._add_header()
    self._add_summary()
    # ... existing sections ...
    self._add_risks_and_gaps()
    self._add_performance_considerations()  # NEW
    
    return '\n'.join(self.output_lines)
```

### Improving Data Realism

#### Add More Realistic Names

Update name lists in domain-specific generators:

```python
spanish_names = [
    'María González López',
    'José Luis Fernández',
    'Ana Patricia Ramírez',
    'Carlos Eduardo Martínez'
]
```

#### Add Domain-Specific Validations

```python
def _validate_marketplace_data(self, data: Dict) -> List[str]:
    errors = []
    if not data.get('title'):
        errors.append('Title is required')
    if len(data.get('title', '')) > 100:
        errors.append('Title must be ≤ 100 characters')
    return errors
```

---

## Performance Considerations

- **No external dependencies**: Uses only Python standard library
- **In-memory processing**: Suitable for typical user story sizes
- **Linear complexity**: Processing time grows linearly with input size
- **File I/O**: Single read, single write per execution

**Typical execution time**: < 1 second for standard user stories

---

## Testing the Agent

### Unit Testing Approach

Create test files for each domain:

```bash
python src/main.py example/input-marketplace.md
python src/main.py example/input-core.md
python src/main.py example/input-gamification.md
```

Verify outputs contain:
- Correct domain detection
- Domain-specific data
- Proper UTF-8 encoding
- All 8 sections

### Edge Case Testing

Test with incomplete inputs:

```bash
python src/main.py example/input-very-incomplete.md
```

Verify:
- Missing sections reported
- Assumptions documented
- No crashes
- Recommendations provided

---

## Troubleshooting

### Common Development Issues

**Issue**: New domain not detected

**Solution**: Check keyword matching in `_extract_domain()`. Ensure keywords are lowercase and comprehensive.

**Issue**: Mock generator returns empty list

**Solution**: Verify backend string is being passed correctly. Check for None values. Add defensive `or ''` checks.

**Issue**: UTF-8 characters escaped in output

**Solution**: Ensure all `json.dumps()` calls include `ensure_ascii=False` parameter.

**Issue**: Missing section not reported

**Solution**: Add section name to `_identify_missing_sections()` expected list in `parser.py`.

---

## Code Quality Standards

### Style Guidelines

- **PEP 8** compliance for Python code
- **Type hints** for function parameters and return values
- **Docstrings** for all classes and public methods
- **Descriptive variable names** (avoid single letters except in comprehensions)

### Documentation Requirements

- Module-level docstrings explaining purpose
- Function docstrings with Parameters/Returns sections
- Inline comments for complex logic
- Example usage in docstrings where applicable

### Testing Requirements

- Test with all example input files before committing
- Verify UTF-8 encoding in outputs
- Check for regressions in existing domains
- Test with missing sections to verify graceful degradation

---

## Future Enhancements

### Planned Features

1. **Database dialect support**: Generate seeds for PostgreSQL, MySQL, MongoDB
2. **Test code generation**: Generate actual test functions, not just data
3. **Integration with test frameworks**: Export to pytest, Jest formats
4. **Visual coverage report**: HTML output with coverage visualization
5. **Multi-language support**: Full Spanish documentation mode

### Extension Points

- Custom domain plugins
- Pluggable mock templates
- External data sources (APIs, databases)
- Custom validation rules
- Alternative output formats (JSON, YAML)

---

## Glossary

- **Domain**: Module or bounded context (Marketplace, Core, Gamification)
- **Dataset**: Set of test data for a specific scenario (happy path, edge case, etc.)
- **Mock**: Test double that simulates external dependencies
- **Seed**: Initial database records for testing
- **Coverage Mapping**: Traceability between acceptance criteria and test artifacts
- **Entity**: Database table or domain model (User, Item, Transaction)
- **Acceptance Criteria**: Testable conditions that define story completion

---

*For user-facing documentation, see [README.md](README.md)*

*Part of the ReUseITESO project - Academic use only*
