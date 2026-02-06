# Mock & Test Data Agent

## Overview

The **Mock & Test Data Agent** is an internal development tool for the ReUseITESO project that automatically generates mock data, test datasets, API payloads, database seeds, and other testing artifacts from user story documents.

This agent accelerates development and testing by providing ready-to-use test data that covers happy paths, edge cases, and negative scenarios.

---

## Purpose

- Generate realistic test data (mocks) from user stories
- Propose JSON structures for testing and development
- Create seed data for common scenarios and edge cases
- Support functional and integration testing
- Map acceptance criteria to test datasets and mocks
- **Domain-aware generation**: Automatically detects the module (Marketplace, Core, Gamification) and generates contextually appropriate data

---

## How It Works

The agent follows this workflow:

1. **Parse** the input user story markdown file
2. **Extract** entities, fields, and implementation details
3. **Generate** three types of datasets:
   - Happy Path (valid data)
   - Edge Cases (boundary conditions)
   - Negative Cases (invalid data for error testing)
4. **Create** mock definitions for external dependencies
5. **Build** API payload examples with common error responses
6. **Produce** database seed data
7. **Map** acceptance criteria to datasets and mocks
8. **Identify** risks, gaps, and missing information
9. **Output** everything in a structured markdown file to the `output/` directory

---

## Quick Start Guide

### Step 1: Prerequisites

Ensure you have Python 3.8 or higher installed on your system:

```bash
python --version
```

If you don't have Python installed, download it from [python.org](https://www.python.org/downloads/).

### Step 2: Navigate to the Agent Directory

Open your terminal/command prompt and navigate to the agent directory:

```bash
cd agents/mock-data-agent
```

### Step 3: (Optional) Set Up a Virtual Environment

Creating a virtual environment is recommended but not required:

**On Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**On macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### Step 4: Verify the Agent

Run the agent without arguments to see usage information:

```bash
python src/main.py
```

You should see output like:
```
Usage: python main.py <input_file.md> [output_file.md]
```

---

## Usage Instructions

### Basic Command Structure

```bash
python src/main.py <input_file> [output_filename]
```

**Parameters:**
- `<input_file>` (required): Path to the user story markdown file
- `[output_filename]` (optional): Name of the output file (will be created in `output/` folder)

**Note:** All output files are automatically saved to the `output/` directory.

### Usage Examples

**Example 1: Generate output with default filename**

```bash
python src/main.py example/input.md
```

This will:
- Read `example/input.md`
- Generate `output/input-output.md` (default naming)

**Example 2: Specify a custom output filename**

```bash
python src/main.py example/input.md publish-item-mocks.md
```

This will:
- Read `example/input.md`
- Generate `output/publish-item-mocks.md`

**Example 3: Process a user story from another location**

```bash
python src/main.py ../../docs/user-stories/create-transaction.md transaction-test-data.md
```

This will:
- Read `../../docs/user-stories/create-transaction.md`
- Generate `output/transaction-test-data.md`

---

## Step-by-Step Tutorial

### Creating Your First Mock Data Output

Follow these steps to generate mock data from a user story:

#### 1. Prepare Your User Story

Create or locate a user story markdown file with the following sections:
- Title (H1 heading)
- User Story
- Detailed Description
- Acceptance Criteria (checklist format)
- Implementation Details (Backend, Frontend, Database)
- Testing Notes

See `example/input.md` for a complete example.

#### 2. Run the Agent

Execute the command:

```bash
python src/main.py path/to/your-story.md
```

#### 3. Monitor the Output

The agent will print progress information:

```
Mock & Test Data Agent
==================================================
Reading input file: example/input.md
Parsing user story...
Generating test data and mocks...
Building output...
Output generated successfully: output/your-story-output.md

==================================================
Summary:
  - User Story: [Story Title]
  - Entities Identified: 2
  - Datasets Generated: 3 (Happy Path, Edge Cases, Negative Cases)
  - Mocks Created: 3
  - Assumptions Made: 0

Done!
```

#### 4. Review the Generated Output

Navigate to the `output/` directory and open your generated markdown file. It will contain:

1. **Summary** - Overview of what was generated
2. **Entities & Data Map** - Identified entities and relationships
3. **Test Data Sets** - Three types of test data (JSON format)
4. **Mock Definitions** - Mock services needed for testing
5. **API Mock Payloads** - Request/response examples
6. **Database Seeds** - Sample database records
7. **Coverage Mapping** - Acceptance criteria mapped to test artifacts
8. **Risks & Gaps** - Missing information and recommendations

#### 5. Use the Generated Artifacts

- Copy JSON data into your test files
- Use mock definitions to set up test doubles
- Implement database seeds for integration tests
- Reference the coverage mapping for test planning

---

## Troubleshooting

### Common Issues and Solutions

**Issue: "Command not found: python"**

- **Solution:** Try using `python3` instead of `python`
- On some systems: `py src/main.py example/input.md`

**Issue: "Input file not found"**

- **Solution:** Check the path to your input file
- Use relative or absolute paths
- Example: `python src/main.py ../example/input.md`

**Issue: "Missing sections detected"**

- **Solution:** This is a warning, not an error
- The agent will continue and make explicit assumptions
- Review the "Missing Information" section in the output
- Update your user story with the missing sections if needed

**Issue: "Output folder not created"**

- **Solution:** The agent creates the `output/` folder automatically
- If it fails, check folder permissions
- Manually create the folder: `mkdir output`

---

## Input Format

The agent expects a markdown file with the following sections:

### Required Sections
- **Title** (H1 heading)
- **User Story** (H2 section with "As a... I want... so that...")
- **Detailed Description** (H2 section) - Supports both English ("Detailed Description", "Description") and Spanish ("Descripción detallada")
- **Acceptance Criteria** (H2 section with checklist)
- **Implementation Details** (H2 section with Backend/Frontend/Database subsections)
- **Testing Notes** (H2 section)

### Optional but Recommended
- **Domain** (H2 section) - Specify "Marketplace", "Core", or "Gamification" for better test data generation
- **Test Data Required**
- **Potential Mocks**
- **Dependencies & Duplication Check**
- **Assumptions**

**Important:** If required sections are missing, the agent will continue but will:
- Make explicit assumptions
- Note missing information in the output
- Generate data based on available context

### Example Input Files

The `example/` directory contains multiple test cases demonstrating different scenarios:

#### Complete Examples (Best Practices)

- **`input-marketplace.md`** - Complete Marketplace user story (item publishing)
  - Shows full implementation details (Backend, Frontend, Database)
  - Domain: Marketplace
  - Tests item creation with categories, images, and validation

- **`input-core.md`** - Authentication user story
  - Domain: Core
  - Tests institutional authentication (@iteso.mx emails)
  - Shows 6-digit institutional_id format

- **`input-gamification.md`** - Points and achievements user story
  - Domain: Gamification
  - Tests point awarding and achievement tracking
  - Includes CO2 savings data

#### Incomplete Examples (Edge Cases)

- **`input-very-incomplete.md`** - Minimal information (only endpoint)
  - Tests extreme case with maximum missing sections
  - Demonstrates gap identification

- **`input-no-domain.md`** - No domain specified
  - Tests generic data generation
  - Shows domain recommendation in output

- **`input-spanish-test.md`** - Spanish section titles
  - Tests "Descripción detallada" (Spanish) support
  - Validates internationalization

#### Template Files

- **`output-template.md`** - Expected output structure
  - Shows all 8 required sections
  - Use as reference for output format

**Recommendation:** Start with `input-marketplace.md` to see a complete example with all sections properly filled.

---

## Output Format

The agent generates a structured markdown file with 8 sections:

1. **Summary** - What was analyzed, artifacts generated, assumptions made
2. **Entities & Data Map** - Entities, relationships, key fields
3. **Test Data Sets** - Happy path, edge cases, negative cases (JSON)
4. **Mock Definitions** - Mock services with success/error variations
5. **API Mock Payloads** - Request/response examples with error codes
6. **Database Seeds** - Sample records with integrity notes
7. **Coverage Mapping** - AC mapped to datasets and mocks (table)
8. **Risks & Gaps** - Missing fields, unclear dependencies, recommendations

See [`example/output-template.md`](example/output-template.md) for the structure.

---

## Project Structure

```
mock-data-agent/
├── README.md                    # This file - Usage guide
├── ARCHITECTURE.md              # Technical architecture and function reference
├── requirements.txt             # Python dependencies (standard library only)
├── .env.example                # Environment variables template
├── .gitignore                  # Git ignore rules
├── output/                     # Generated output files (created automatically)
│   └── *.md                   # Generated mock data outputs
├── example/                    # Test input files for different scenarios
│   ├── input-marketplace.md   # Complete Marketplace example
│   ├── input-core.md          # Authentication example
│   ├── input-gamification.md  # Points/achievements example
│   ├── input-very-incomplete.md    # Minimal information test
│   ├── input-no-domain.md     # Generic domain test
│   ├── input-spanish-test.md  # Spanish sections test
│   └── output-template.md     # Output format reference
└── src/                        # Source code modules
    ├── __init__.py            # Package initialization
    ├── main.py                # Entry point - CLI interface
    ├── parser.py              # Markdown parser for user stories
    ├── generator.py           # Test data and mock generator (domain-aware)
    └── output_builder.py      # Output markdown formatter
```

---

## Features

### Domain-Aware Data Generation
- **Automatic domain detection** from user stories (Marketplace, Core, Gamification)
- Generates contextually appropriate data per module:
  - **Marketplace**: Items, categories, donations, images
  - **Core**: Users, authentication, institutional IDs (6 digits), sessions
  - **Gamification**: Points, achievements, levels, CO2 savings
- Falls back to generic data when domain is not specified

### Smart Entity Detection
- Extracts entities from database schema definitions
- Infers entities from user story context when not explicit
- Documents assumptions when making inferences

### Realistic Test Data
- Generates context-aware data for ReUseITESO domain
- **UTF-8 support**: Properly displays Spanish characters (tildes, ñ)
- Includes proper UUIDs, timestamps, and relational data
- Covers multiple scenarios automatically

### Comprehensive Mock Coverage
- Identifies mocks from implementation details
- Includes authentication, database, external services
- Provides success/error/timeout variations

### API Testing Support
- Generates complete request/response examples
- Documents common HTTP error codes
- Ready to use in API tests or documentation

### Database Seeds
- Creates insertable seed data
- Includes integrity notes (FK constraints, required fields)
- Supports multiple entities

### Traceability
- Maps each acceptance criterion to datasets and mocks
- Helps ensure complete test coverage
- Identifies gaps in testability

---

## Best Practices

1. **Complete User Stories:** Provide as much detail as possible in the input user story. The more information available, the better the generated artifacts.

2. **Review Assumptions:** Always review the "Assumptions Made" section in the output. Validate these with your team before using the generated data.

3. **Customize as Needed:** The generated output is a starting point. Adjust datasets, mocks, and seeds to fit your specific needs.

4. **Version Control:** Keep generated outputs in version control alongside user stories for traceability.

5. **Iterate:** Re-run the agent when user stories are updated to keep test data in sync.

---

## Limitations

- The agent makes assumptions when information is missing
- Cannot validate business logic correctness
- Generated data may need manual adjustment for complex scenarios
- Does not generate actual executable test code (only data)

---

## Contributing

This agent is part of the ReUseITESO project. Follow the guidelines in [`CONTRIBUTING.md`](../../CONTRIBUTING.md) when making changes.

### Making Changes

1. Test your changes with multiple user story examples
2. Ensure generated output follows the template structure
3. Update this README if adding new features
4. Document any new assumptions or limitations

---

## Support

For issues or questions:
1. Check the example files in `example/`
2. Review the agent objective document: [`../objetivo.md`](../objetivo.md)
3. Consult with the team

---

## Technical Documentation

For detailed technical information about the agent's architecture, modules, and functions, see:

📘 **[ARCHITECTURE.md](ARCHITECTURE.md)** - Complete technical reference including:
- Module architecture and data flow
- Detailed function documentation
- Domain-specific generation logic
- Extension guidelines

---

## License

Part of the ReUseITESO project. Academic use only.

---

*Generated and maintained by the ReUseITESO Marketplace Team*
