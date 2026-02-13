#!/bin/bash
# Script to create GitHub issue for logs and audit trail user story
# This script documents the commands needed to create and link the issue

set -e

echo "🤖 Creating Logs and Audit Trail User Story Issue"
echo "=================================================="
echo ""

# Step 1: Already completed - JSON input file created
echo "✅ Step 1: Created examples/logs-audit-input.json"

# Step 2: Already completed - Generated story
echo "✅ Step 2: Generated logs-audit-story.md"

# Step 3: Create GitHub issue with labels
echo ""
echo "📝 Step 3: Create GitHub issue"
echo "Command to run:"
echo ""
echo "  cd agents/user-story-generator"
echo "  export GH_TOKEN=\$GITHUB_TOKEN"
echo "  python src/generator.py --input examples/logs-audit-input.json --github --labels \"user-story,core,monitoring\""
echo ""
echo "Note: This requires GH_TOKEN environment variable to be set with a GitHub personal access token"
echo "      or gh CLI to be authenticated with 'gh auth login'"
echo ""

# Alternative: Use gh CLI directly
echo "Alternative using gh CLI directly:"
echo ""
echo "  gh issue create \\"
echo "    --repo ReUseITESO/ReUse \\"
echo "    --title \"User can view activity logs and audit trail\" \\"
echo "    --body-file agents/user-story-generator/logs-audit-story.md \\"
echo "    --label \"user-story\" \\"
echo "    --label \"core\" \\"
echo "    --label \"monitoring\""
echo ""

# Step 4: Add to project
echo "📊 Step 4: Add issue to project"
echo "Command to run (after issue is created):"
echo ""
echo "  ISSUE_URL=\$(gh issue view <ISSUE_NUMBER> --repo ReUseITESO/ReUse --json url -q .url)"
echo "  gh project item-add 1 --owner ReUseITESO --url \$ISSUE_URL"
echo ""

# Step 5: Commit and push - Already done
echo "✅ Step 5: Files committed and pushed to branch copilot/create-activity-logs-audit"
echo ""

echo "📋 Summary"
echo "=========="
echo "Input file: agents/user-story-generator/examples/logs-audit-input.json"
echo "Story file: agents/user-story-generator/logs-audit-story.md"
echo "Branch: copilot/create-activity-logs-audit"
echo ""
echo "⚠️  Note: Issue creation requires GitHub authentication"
echo "    Please ensure GH_TOKEN is set or gh CLI is authenticated before running issue creation commands"
