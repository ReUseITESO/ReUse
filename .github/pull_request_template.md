## 📌 Summary
Briefly describe what this Pull Request does and why it is needed.

---

## 🔍 Type of Change
Mark the relevant option(s):
- [ ] Feature (New functionality)
- [ ] Bug fix
- [ ] Agent (Development tooling/automation)
- [ ] Documentation / Rules
- [ ] Refactor / Cleanup

---

## 🧩 Scope
Which part of the project is affected?
- [ ] Backend
- [ ] Frontend
- [ ] Agents
- [ ] Docs
- [ ] CI / Infrastructure

---

## 🤖 Agent Details (if applicable)
If this PR adds or updates an agent:
- **Agent name:**
- **Purpose of the agent:**
- **Input(s):**
- **Output(s):**
- **Example included:** - [ ] Yes  
  - [ ] No (explain why)

---

## 🏗 GitFlow & Branching
- [ ] [cite_start]This branch was created from `develop`.
- [ ] [cite_start]Branch name follows `feature-[name]` format[cite: 19].
- [ ] [cite_start]I have **NOT** used `--force` push on protected branches[cite: 26].

---

## 🧪 Testing Evidence
Describe how this change was tested and **paste terminal screenshots** of the green checks.

- [ ] **Local execution**
- [ ] **Manual testing**
- [ ] **Unit tests**
- [ ] **Not applicable** (explain why)

**Static Analysis Results:**
- [cite_start]**Frontend:** `npx biome check .` and `npx eslint .` [cite: 62, 63, 125, 154]
- [cite_start]**Backend:** `ruff check .` and `mypy .` [cite: 68, 137, 157]

---

## ✅ Quality Checklist
- [ ] [cite_start]**Formatting:** Biome or Ruff format check passed[cite: 74, 129, 139].
- [ ] [cite_start]**Linting:** Biome or Ruff lint check passed[cite: 74, 127, 141].
- [ ] [cite_start]**Static Analysis:** ESLint or MyPy check passed[cite: 154, 157].
- [ ] **Build:** `npm run build` (Next.js) or Django migrations successful.
- [ ] **Impacted Areas:** I have verified this doesn't break other modules.

---

## 📎 Related Context
[cite_start]Link to related issues, discussions, or Kanban ticket references[cite: 27].

---

## 📝 Notes for Project Leaders
Anything reviewers should pay special attention to? (e.g., special instructions for the two Project Leaders).