# 🤖 Development Agents - ReUseITESO

This directory contains **development agents** used by the team to improve productivity and code quality during the development of ReUseITESO.

⚠️ **Important:** Agents are **NOT part of the ReUseITESO application**. They are internal tools used to build the product.

---

## Available Agents

### 1. User Story Generator Agent

**Team:** Core  
**Status:** ✅ Production Ready  
**Version:** 1.0.0

**Purpose:** Generate complete, production-ready user stories for the ReUseITESO backlog.

**Features:**
- ✅ Generates stories with 9 required sections
- ✅ Detects duplicate stories
- ✅ Identifies dependencies
- ✅ Validates format and completeness
- ✅ Alerts when stories are too large
- ✅ Documents assumptions explicitly

**Quick Start:**
```bash
cd user-story-generator
./quick-start.sh
```

**Documentation:**
- [README.md](user-story-generator/README.md) - Complete documentation (English)
- [GUIA-DE-USO.md](user-story-generator/GUIA-DE-USO.md) - Usage guide (Spanish)
- [RESUMEN-EQUIPO.md](user-story-generator/RESUMEN-EQUIPO.md) - Team summary (Spanish)

---

## Agent Guidelines

All agents in this directory must follow these guidelines:

### Required Files

Each agent must include:
- `README.md` - Purpose and usage documentation
- `src/` - Executable code
- `examples/` - Input and output examples
- `.env.example` - Required environment variables (if any)

### Best Practices

- ✅ Agents must be runnable locally
- ✅ Inputs and outputs must be explicit
- ✅ Avoid hard-coded assumptions
- ✅ Document all assumptions made
- ✅ Prefer simple, readable implementations
- ✅ Include usage examples

### Development Workflow

1. Create agent in feature branch: `agent/<agent-name>`
2. Include all required files
3. Test thoroughly
4. Document usage
5. Open Pull Request
6. Get team review
7. Merge to main

---

## Creating a New Agent

To create a new agent:

```bash
# Create agent directory
mkdir -p agents/my-agent/src
mkdir -p agents/my-agent/examples

# Create required files
touch agents/my-agent/README.md
touch agents/my-agent/.env.example
touch agents/my-agent/requirements.txt

# Add your code
# ...

# Document usage
# ...

# Test
# ...

# Commit and push
git checkout -b agent/my-agent
git add agents/my-agent
git commit -m "Add my-agent"
git push origin agent/my-agent
```

---

## Agent Categories

Agents can be categorized by purpose:

### Code Generation
- Generate boilerplate code
- Create test files
- Generate mocks

### Quality Assurance
- Code review automation
- Test coverage analysis
- Linting and formatting

### Documentation
- Generate API documentation
- Create user stories (✅ implemented)
- Update diagrams

### Development Support
- Database migrations
- Environment setup
- Deployment automation

---

## Using Agents

### Local Usage

Most agents can be run locally:

```bash
cd agents/<agent-name>
python src/main.py [options]
```

### CI/CD Integration

Some agents can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run agent
  run: |
    cd agents/<agent-name>
    python src/main.py --input $INPUT --output $OUTPUT
```

### Programmatic Usage

Agents can be imported and used programmatically:

```python
import sys
sys.path.append('agents/<agent-name>/src')

from agent import AgentClass

agent = AgentClass()
result = agent.run(input_data)
```

---

## Agent Maintenance

### Updating an Agent

1. Create feature branch: `agent/<agent-name>-update`
2. Make changes
3. Update documentation
4. Test thoroughly
5. Update CHANGELOG.md
6. Open Pull Request

### Deprecating an Agent

If an agent is no longer needed:

1. Mark as deprecated in README
2. Document replacement (if any)
3. Keep for one semester
4. Archive or remove

---

## Contributing

To contribute to agents:

1. Follow [CONTRIBUTING.md](../CONTRIBUTING.md) guidelines
2. Ensure agent follows guidelines above
3. Include comprehensive documentation
4. Add usage examples
5. Test thoroughly

---

## Support

For questions about agents:

1. Check agent's README.md
2. Review examples
3. Ask the team that owns the agent
4. Open an issue if needed

---

## Future Agents (Ideas)

Potential agents to develop:

- [ ] Unit Test Generator
- [ ] Mock Data Generator
- [ ] API Documentation Generator
- [ ] Code Review Assistant
- [ ] Database Migration Helper
- [ ] Component Generator (Frontend)
- [ ] Endpoint Generator (Backend)
- [ ] Integration Test Generator

---

## Notes

- Agents are shared across all teams
- Agents are treated as internal developer tools
- Quality standards apply to agents too
- Agents should be maintained like production code
- Document decisions and assumptions

---

**Last Updated:** February 3, 2026  
**Active Agents:** 1  
**Status:** Growing
