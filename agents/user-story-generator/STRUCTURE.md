# 📁 User Story Generator Agent - Project Structure

```
user-story-generator/
│
├── 📄 README.md                    # Complete documentation (English)
├── 📄 GUIA-DE-USO.md              # Usage guide (Spanish)
├── 📄 RESUMEN-EQUIPO.md           # Team summary (Spanish)
├── 📄 CHANGELOG.md                # Version history
├── 📄 STRUCTURE.md                # This file
├── 📄 TEST.md                     # Testing guide
│
├── 📄 requirements.txt            # Python dependencies (none required)
├── 📄 .env.example                # Environment variables template
├── 📄 .gitignore                  # Git ignore rules
├── 🔧 quick-start.sh              # Quick start script
│
├── 📂 src/                        # Source code
│   ├── 📄 __init__.py            # Python module initialization
│   ├── 📄 generator.py           # Main generation logic
│   ├── 📄 models.py              # Data models and structures
│   ├── 📄 validators.py          # Validation and checking logic
│   └── 📄 validate_story.py      # Standalone validation script
│
├── 📂 examples/                   # Usage examples
│   ├── 📄 input-example.json     # Simple input example
│   ├── 📄 output-example.md      # Validated output example
│   ├── 📄 complex-input.json     # Complex story with dependencies
│   ├── 📄 complex-output.md      # Complex story output
│   ├── 📄 existing-stories.json  # Sample existing stories
│   └── 🐍 programmatic-usage.py  # Python API examples
│
└── 📂 templates/                  # Output templates
    └── 📄 story-template.md       # Base markdown template
```

---

## 📦 Component Overview

### Core Components

#### 1. `src/generator.py`
**Purpose:** Main story generation logic

**Key Classes:**
- `UserStoryGenerator`: Main generator class

**Key Methods:**
- `generate()`: Generate story from parameters
- `generate_from_input()`: Generate from StoryInput object
- `_generate_user_story_statement()`: Create "As a... I want..." format
- `_generate_acceptance_criteria()`: Generate checklist criteria
- `_generate_implementation_details()`: Create backend/frontend/database details

**Usage:**
```python
from generator import UserStoryGenerator

generator = UserStoryGenerator()
story = generator.generate(title="...", domain="...", description="...")
```

---

#### 2. `src/models.py`
**Purpose:** Data structures and models

**Key Classes:**
- `UserStory`: Complete story structure with all sections
- `StoryInput`: Input data for generation
- `ExistingStory`: Represents existing stories for duplication checking
- `ImplementationDetails`: Backend/Frontend/Database details
- `Domain`: Enum for Core/Marketplace/Gamification
- `DetailLevel`: Enum for basic/detailed/comprehensive

**Key Methods:**
- `UserStory.validate()`: Validate story completeness
- `UserStory.to_markdown()`: Generate markdown output
- `UserStory.is_too_large()`: Check if story should be split

---

#### 3. `src/validators.py`
**Purpose:** Validation and checking logic

**Key Classes:**
- `DuplicationChecker`: Detect similar stories
- `DependencyAnalyzer`: Identify dependencies
- `StoryValidator`: Validate format and completeness
- `TechnologyValidator`: Check for undefined technologies

**Key Methods:**
- `DuplicationChecker.check_duplicates()`: Find similar stories
- `DependencyAnalyzer.identify_dependencies()`: Find dependencies
- `StoryValidator.validate_format()`: Check format rules
- `StoryValidator.check_quality()`: Quality suggestions

---

#### 4. `src/validate_story.py`
**Purpose:** Standalone validation script

**Key Classes:**
- `StoryFormatValidator`: Validate markdown files

**Usage:**
```bash
python3 src/validate_story.py story.md
```

---

### Documentation Files

#### 1. `README.md` (English)
- Complete technical documentation
- Installation and setup
- Usage examples
- API reference
- Contribution guidelines

#### 2. `GUIA-DE-USO.md` (Spanish)
- Practical usage guide
- Step-by-step examples
- Best practices
- Troubleshooting
- Tips for writing good stories

#### 3. `RESUMEN-EQUIPO.md` (Spanish)
- Team summary
- Requirements compliance
- Delivered components
- Quick start guide
- Known limitations

#### 4. `TEST.md`
- Testing guide
- Test cases
- Validation tests
- Integration tests
- Performance tests

#### 5. `CHANGELOG.md`
- Version history
- Features
- Known limitations
- Future improvements

---

### Example Files

#### 1. `examples/input-example.json`
Simple story input with context

#### 2. `examples/output-example.md`
Validated story output

#### 3. `examples/complex-input.json`
Complex story with multiple dependencies

#### 4. `examples/existing-stories.json`
Sample backlog for duplication checking

#### 5. `examples/programmatic-usage.py`
Python API usage examples

---

### Configuration Files

#### 1. `requirements.txt`
Python dependencies (none required for basic usage)

#### 2. `.env.example`
Optional environment variables:
- `EXISTING_STORIES_PATH`
- `DETAIL_LEVEL`
- `OUTPUT_DIR`

#### 3. `.gitignore`
Ignore patterns for:
- Python cache files
- Generated stories
- Environment files
- IDE files

---

### Scripts

#### 1. `quick-start.sh`
Interactive quick start script with menu:
1. Generate example story
2. Interactive mode
3. Generate from input file

---

## 🔄 Data Flow

```
Input (JSON/CLI)
    ↓
StoryInput Object
    ↓
UserStoryGenerator
    ↓
├─→ Generate User Story Statement
├─→ Generate Description
├─→ Generate Acceptance Criteria
├─→ Generate Implementation Details
├─→ Generate Testing Notes
├─→ Generate Test Data Requirements
├─→ Generate Potential Mocks
├─→ Check Duplicates (DuplicationChecker)
├─→ Identify Dependencies (DependencyAnalyzer)
└─→ Validate & Add Warnings (StoryValidator)
    ↓
UserStory Object
    ↓
Markdown Output
```

---

## 🎯 Key Features by Component

### Generator (`generator.py`)
- ✅ Multiple input modes (CLI, JSON, interactive)
- ✅ Context-aware generation
- ✅ Assumption documentation
- ✅ Warning generation

### Models (`models.py`)
- ✅ Type-safe data structures
- ✅ Validation methods
- ✅ Markdown export
- ✅ Size checking

### Validators (`validators.py`)
- ✅ Duplication detection (70% similarity threshold)
- ✅ Dependency analysis (keyword-based)
- ✅ Format validation (no Given/When/Then)
- ✅ Technology validation
- ✅ Quality checking

### Validation Script (`validate_story.py`)
- ✅ Standalone validation
- ✅ Section checking
- ✅ Format verification
- ✅ Quality warnings

---

## 📊 File Sizes (Approximate)

```
generator.py       ~15 KB  (350 lines)
models.py          ~8 KB   (200 lines)
validators.py      ~10 KB  (250 lines)
validate_story.py  ~6 KB   (150 lines)

Total Code:        ~39 KB  (950 lines)
```

---

## 🔧 Extension Points

### Adding New Domains
Edit `src/models.py` line 9:
```python
class Domain(Enum):
    CORE = "Core"
    MARKETPLACE = "Marketplace"
    GAMIFICATION = "Gamification"
    NEW_DOMAIN = "NewDomain"  # Add here
```

### Adding New Validators
Edit `src/validators.py`:
```python
class CustomValidator:
    @staticmethod
    def validate_custom_rule(story: UserStory) -> List[str]:
        # Your validation logic
        pass
```

### Customizing Templates
Edit `templates/story-template.md` to change output format.

### Adding New Detail Levels
Edit `src/models.py` line 14:
```python
class DetailLevel(Enum):
    BASIC = "basic"
    DETAILED = "detailed"
    COMPREHENSIVE = "comprehensive"
    CUSTOM = "custom"  # Add here
```

---

## 🚀 Quick Reference

### Generate Story
```bash
python3 src/generator.py --example
```

### Validate Story
```bash
python3 src/validate_story.py story.md
```

### Interactive Mode
```bash
python3 src/generator.py --interactive
```

### From JSON
```bash
python3 src/generator.py --input input.json --output output.md
```

### Programmatic
```python
from generator import UserStoryGenerator
generator = UserStoryGenerator()
story = generator.generate(title="...", domain="...", description="...")
print(story.to_markdown())
```

---

## 📚 Related Files

- `../../README.md` - ReUseITESO project overview
- `../../CONTRIBUTING.md` - Contribution guidelines
- `../../docs/` - Project documentation

---

## 🎓 Learning Path

1. **Start here:** `README.md` - Understand what the agent does
2. **Try it:** `quick-start.sh` - Generate your first story
3. **Learn usage:** `GUIA-DE-USO.md` - Practical examples
4. **Understand code:** `src/models.py` → `src/generator.py` → `src/validators.py`
5. **Test it:** `TEST.md` - Run test cases
6. **Extend it:** Modify validators or add features

---

## ✅ Quality Checklist

- ✅ All required sections implemented
- ✅ Validation working correctly
- ✅ Examples provided and tested
- ✅ Documentation complete (English + Spanish)
- ✅ No external dependencies required
- ✅ Ready for production use

---

**Last Updated:** 2026-02-03  
**Version:** 1.0.0  
**Team:** Core
