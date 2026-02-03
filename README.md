# ♻️ ReUseITESO

## Overview

**ReUseITESO** is a **responsive web application** designed for the ITESO university community to promote **reuse, donation, exchange, and responsible consumption** of items such as books, electronics, clothing, and school supplies.

The platform works as an **internal marketplace**, restricted to authenticated ITESO users, and encourages sustainable behavior through **gamification and impact tracking**.

This repository is a **monorepo** that contains:
- the backend,
- the frontend,
- and the shared **development agents** used during the project.

The project is developed as part of an academic course, but follows **real-world software engineering practices**.

---

## Repository Structure (Monorepo)

/
├── backend/ # Python backend (API, business logic)
├── frontend/ # Next.js + TypeScript frontend
├── agents/ # Development agents (agentic development)
│ ├── shared/
│ └── <agent-name>/
├── docs/ # Architecture, diagrams, decisions (ADRs)
└── README.md


### 📦 Backend
- Language: **Python**
- Purpose: business logic, APIs, integrations, data access
- Organized by functional domains (Core, Marketplace, Gamification)

### 🎨 Frontend
- Framework: **Next.js**
- Language: **TypeScript**
- Responsive web application
- Consumes backend APIs

### 🤖 Agents
The `/agents` directory contains **development agents**, not product features.

Agents are tools used by the team to:
- generate user stories,
- create unit tests,
- generate mocks,
- review code,
- assist with documentation and quality.

⚠️ **Agents are NOT part of the ReUseITESO application itself.**  
They are part of the **tooling used to build the product**.

---

## Core Functional Domains

### Core
- Authentication and account management
- User profile
- Home and navigation
- Notifications
- Base integrations (email / events)

### Marketplace
- Item publication and management
- Search and filtering
- User interactions
- Transactions (buy, donate, exchange)

### Gamification
- Points system
- Achievements and badges
- Challenges and campaigns
- Ecological impact metrics

---

## Development Principles

- Prefer **clarity over cleverness**
- Modular design with clear boundaries
- Shared database model governed centrally
- Quality and consistency matter more than feature count
- Continuous integration from early stages
- Decisions should be realistic for a **one-semester project**

---

## Working with Agents (Important)

- All agents live under `/agents/<agent-name>/`
- Each agent must include:
  - `README.md`
  - clear input/output examples
  - runnable code
- Agents are developed via **feature branches and Pull Requests**
- Agents are shared across all teams

> Agents are treated as **internal developer tools**, just like CI pipelines or linters.

---

## Contribution Workflow (High Level)

- `main` branch is protected
- No direct pushes to `main`
- All work is done via feature branches
- Pull Requests require review
- Standards are enforced early to avoid technical debt

---

## Non-Goals

- This is not a commercial e-commerce platform
- AI features are not part of the product
- Over-engineering is discouraged
- The goal is learning through realistic engineering constraints

---

## Guiding Question

> *How would we build this if it were a real internal product for a university community, with limited time and real users?*
