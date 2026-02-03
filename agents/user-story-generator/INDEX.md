# 📑 User Story Generator Agent - Quick Index

## 🚀 Start Here

**New to the agent?** → [GUIA-DE-USO.md](GUIA-DE-USO.md) (Spanish)  
**Technical docs?** → [README.md](README.md) (English)  
**Quick test?** → Run `./quick-start.sh`

---

## 📚 Documentation Map

### For Users

| Document | Purpose | Language | Read Time |
|----------|---------|----------|-----------|
| [GUIA-DE-USO.md](GUIA-DE-USO.md) | Practical usage guide | 🇪🇸 Spanish | 10 min |
| [README.md](README.md) | Complete documentation | 🇬🇧 English | 15 min |
| [quick-start.sh](quick-start.sh) | Interactive script | - | 2 min |

### For Team

| Document | Purpose | Language | Read Time |
|----------|---------|----------|-----------|
| [RESUMEN-EQUIPO.md](RESUMEN-EQUIPO.md) | Team summary | 🇪🇸 Spanish | 12 min |
| [ENTREGA.md](ENTREGA.md) | Delivery document | 🇪🇸 Spanish | 15 min |
| [SUMMARY.md](SUMMARY.md) | Visual summary | 🇪🇸 Spanish | 5 min |

### For Developers

| Document | Purpose | Language | Read Time |
|----------|---------|----------|-----------|
| [STRUCTURE.md](STRUCTURE.md) | Project structure | 🇬🇧 English | 12 min |
| [TEST.md](TEST.md) | Testing guide | 🇬🇧 English | 8 min |
| [CHANGELOG.md](CHANGELOG.md) | Version history | 🇬🇧 English | 3 min |

---

## 🎯 Quick Actions

### I want to...

**Generate my first story**
```bash
./quick-start.sh
# Choose option 1 or 2
```

**Generate from a JSON file**
```bash
python3 src/generator.py --input my-input.json --output my-story.md
```

**Validate a generated story**
```bash
python3 src/validate_story.py my-story.md
```

**Use it in Python code**
```python
from src.generator import UserStoryGenerator
generator = UserStoryGenerator()
story = generator.generate(title="...", domain="...", description="...")
print(story.to_markdown())
```

**Check for duplicates**
```bash
python3 src/generator.py \
  --input my-input.json \
  --existing-stories backlog.json \
  --output my-story.md
```

**See examples**
```bash
ls examples/
# Check input-example.json and output-example.md
```

---

## 📂 File Organization

```
📁 Root Level
├── 📄 INDEX.md (this file)
├── 📄 README.md (main docs)
├── 📄 GUIA-DE-USO.md (usage guide)
└── 🔧 quick-start.sh (quick start)

📁 Documentation
├── 📄 RESUMEN-EQUIPO.md (team summary)
├── 📄 ENTREGA.md (delivery doc)
├── 📄 SUMMARY.md (visual summary)
├── 📄 STRUCTURE.md (architecture)
├── 📄 TEST.md (testing)
└── 📄 CHANGELOG.md (history)

📁 Source Code
└── src/
    ├── generator.py (main logic)
    ├── models.py (data models)
    ├── validators.py (validation)
    └── validate_story.py (validator script)

📁 Examples
└── examples/
    ├── input-example.json
    ├── output-example.md
    ├── complex-input.json
    ├── existing-stories.json
    └── programmatic-usage.py

📁 Configuration
├── requirements.txt
├── .env.example
└── .gitignore
```

---

## 🎓 Learning Path

### Beginner (15 minutes)

1. Read [GUIA-DE-USO.md](GUIA-DE-USO.md) - Sections 1-3
2. Run `./quick-start.sh` - Option 1 (example)
3. Check `examples/output-example.md`

### Intermediate (30 minutes)

1. Read [README.md](README.md) - Full document
2. Try interactive mode: `python3 src/generator.py --interactive`
3. Create your own JSON input
4. Generate and validate a story

### Advanced (1 hour)

1. Read [STRUCTURE.md](STRUCTURE.md)
2. Review source code in `src/`
3. Try programmatic usage: `examples/programmatic-usage.py`
4. Customize validators or templates

---

## 🔍 Find What You Need

### I need to know...

**How to use the agent** → [GUIA-DE-USO.md](GUIA-DE-USO.md)  
**What it can do** → [README.md](README.md) or [SUMMARY.md](SUMMARY.md)  
**How it works** → [STRUCTURE.md](STRUCTURE.md)  
**How to test it** → [TEST.md](TEST.md)  
**What was delivered** → [ENTREGA.md](ENTREGA.md)  
**Team overview** → [RESUMEN-EQUIPO.md](RESUMEN-EQUIPO.md)  
**Version history** → [CHANGELOG.md](CHANGELOG.md)

### I want to see...

**Examples** → `examples/` directory  
**Code** → `src/` directory  
**Templates** → `templates/` directory  
**Configuration** → `.env.example`, `requirements.txt`

---

## ⚡ Quick Reference

### Commands

```bash
# Generate example
python3 src/generator.py --example

# Interactive mode
python3 src/generator.py --interactive

# From JSON
python3 src/generator.py --input file.json --output story.md

# With existing stories
python3 src/generator.py --input file.json --existing-stories backlog.json

# Validate
python3 src/validate_story.py story.md

# Quick start
./quick-start.sh
```

### Python API

```python
# Import
from src.generator import UserStoryGenerator
from src.models import StoryInput, ExistingStory

# Generate
generator = UserStoryGenerator()
story = generator.generate(
    title="User can do something",
    domain="Core",
    description="Detailed description"
)

# Output
print(story.to_markdown())

# Validate
is_valid, errors = story.validate()
```

---

## 🆘 Troubleshooting

**Agent not working?**
1. Check Python version: `python3 --version` (need 3.9+)
2. Check you're in the right directory
3. Review error messages
4. Check [GUIA-DE-USO.md](GUIA-DE-USO.md) - Troubleshooting section

**Story validation failing?**
1. Run: `python3 src/validate_story.py your-story.md`
2. Read error messages
3. Fix issues
4. Validate again

**Need help?**
1. Check documentation
2. Review examples
3. Contact Core team

---

## 📊 Status

```
Version:     1.0.0
Status:      ✅ Production Ready
Last Update: February 3, 2026
Team:        Core
Language:    Python 3.9+
```

---

## 🎯 Next Steps

1. **First time?** → Read [GUIA-DE-USO.md](GUIA-DE-USO.md)
2. **Want to try?** → Run `./quick-start.sh`
3. **Need details?** → Read [README.md](README.md)
4. **Want to code?** → Check [STRUCTURE.md](STRUCTURE.md)
5. **Ready to use?** → Generate your first story!

---

**Happy story generation! 🚀**
