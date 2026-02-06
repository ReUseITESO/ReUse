# Changelog - User Story Generator Agent

## Version 1.0.0 (2026-02-03)

### Initial Release

#### Features
- ✅ Complete user story generation with 9 required sections
- ✅ Support for 3 domains: Core, Marketplace, Gamification
- ✅ Duplication detection based on title similarity
- ✅ Dependency analysis using keyword matching
- ✅ Format validation (no Given/When/Then allowed)
- ✅ Technology validation (warns about undefined tech)
- ✅ Story size detection (warns if too large)
- ✅ Multiple input modes: CLI, JSON file, interactive
- ✅ Markdown output with proper formatting
- ✅ Validation script for generated stories

#### Components
- `generator.py`: Main generation logic
- `models.py`: Data models and structures
- `validators.py`: Validation and checking logic
- `validate_story.py`: Standalone validation script

#### Examples
- Basic input/output example
- Complex story example
- Existing stories for duplication checking

#### Documentation
- README.md (English)
- GUIA-DE-USO.md (Spanish)
- TEST.md (Testing guide)
- CHANGELOG.md (This file)

#### Scripts
- `quick-start.sh`: Interactive quick start script

### Known Limitations
- Dependency detection is keyword-based (not semantic)
- User story statement generation could be improved
- No support for custom templates yet
- No automated test suite yet

### Future Improvements
- [ ] Semantic dependency analysis
- [ ] Custom template support
- [ ] Automated test suite with pytest
- [ ] YAML input support
- [ ] Story splitting suggestions
- [ ] Integration with backlog management tools
- [ ] AI-powered story enhancement (optional)
