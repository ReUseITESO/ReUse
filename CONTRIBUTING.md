# Contributing to ReUseITESO

Thank you for contributing to **ReUseITESO** 🎉  
This project is developed as part of an academic course but follows **real-world software engineering practices**.

The goal of this document is to keep contributions **clear, consistent, and maintainable** throughout the semester.

---

## General Principles

- Clarity over cleverness
- Small, focused changes are preferred
- Code, agents, and documentation should be understandable by others
- Decisions must be realistic for a one-semester project
- If something is unclear, document the assumption

---

## Repository Structure

This is a **monorepo**:

/
├── backend/
├── frontend/
├── agents/
├── docs/

markdown
Copiar código

Each area has its own responsibility:
- `backend/`: Python backend
- `frontend/`: Next.js + TypeScript frontend
- `agents/`: Development agents (tooling, not product features)
- `docs/`: Architecture, diagrams, ADRs, and decisions

---

## Branching Strategy

- The `main` branch is protected
- No direct commits to `main`
- All work must be done in feature branches

### Branch Naming Convention

Use one of the following prefixes:

feature/<short-description>
fix/<short-description>
agent/<agent-name>
docs/<short-description>
chore/<short-description>

yaml
Copiar código

Examples:
- `feature/marketplace-search`
- `agent/story-writer`
- `docs/architecture-v1`

---

## Pull Requests

All changes must be submitted via **Pull Request**.

### Pull Request Requirements

A Pull Request must:
- Have a clear title and description
- Explain **what** was changed and **why**
- Be small and focused
- Reference related tasks or decisions (if applicable)

### Pull Request Checklist

Before requesting a review, make sure that:
- [ ] Code builds successfully
- [ ] Tests (if applicable) pass
- [ ] Code follows agreed standards
- [ ] Documentation is updated if needed
- [ ] No unrelated changes are included

---

## Working with Agents

Agents are **internal development tools**, not product features.

### Agent Location

All agents must live under:

/agents/<agent-name>/

yaml
Copiar código

### Required Files for Each Agent

Each agent must include at minimum:
- `README.md` – purpose and usage
- `src/` – executable code
- `examples/` – input and output examples
- `.env.example` – required environment variables
- Configuration files needed to run the agent

### Agent Guidelines

- Agents must be runnable locally
- Inputs and outputs must be explicit
- Agents should avoid hard-coded assumptions
- If the agent makes assumptions, they must be documented
- Prefer simple, readable implementations

---

## Code Quality and Standards

- Follow the coding standards defined by the Tech Lead
- Prefer readable and maintainable code
- Avoid over-engineering
- Keep functions and modules focused

Static analysis, linting, and formatting tools may be enforced via CI.

---

## Documentation

- Architectural decisions should be documented in `docs/`
- Diagrams and ADRs should be kept up to date
- If you make a decision that impacts others, document it

---

## AI / GenAI Usage

The use of **AI tools (GenAI)** is allowed and encouraged as a **development aid**.

However:
- Contributors are responsible for reviewing all generated content
- AI-generated code must be understood by the contributor
- Do not blindly commit AI-generated output
- Avoid hallucinated facts, APIs, or libraries

> AI is a tool, not a substitute for engineering judgment.

---

## Final Note

If you are unsure about a change:
- Ask the team
- Open a discussion
- Document the assumption

> *Good software is built through collaboration, not isolation.*
