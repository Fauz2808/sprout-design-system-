#!/bin/bash
# Sprout → GitHub setup script
# Run this from your terminal inside the Sprout folder:
#   cd /path/to/Sprout
#   bash push-to-github.sh

set -e

REPO_NAME="sprout-design"
GITHUB_USER=""  # Fill in your GitHub username, e.g. "fauzanahmad"

echo "=== Sprout GitHub Setup ==="

# 1. Clean up any stale git state from the sandbox attempt
if [ -f ".git/index.lock" ]; then
  echo "Removing stale git lock..."
  rm .git/index.lock
fi

# If .git already exists from the sandbox attempt, remove it and start fresh
if [ -d ".git" ]; then
  echo "Removing previous git init..."
  rm -rf .git
fi

# 2. Init fresh git repo
echo "Initializing git repository..."
git init
git branch -M main
git config user.email "ahmad@joinsprout.co"
git config user.name "Fauzan"

# 3. Stage everything (04 - Design System & Storybook has its own git repo, skip it)
git add .
git status --short

# 4. Initial commit
echo ""
echo "Creating initial commit..."
git commit -m "Initial commit — Sprout design system & assets"

# 5. Create GitHub repo and push
#    Requires GitHub CLI (gh) — install from https://cli.github.com if needed
if command -v gh &> /dev/null; then
  echo ""
  echo "Creating GitHub repo '$REPO_NAME'..."
  gh repo create "$REPO_NAME" --private --source=. --remote=origin --push
  echo ""
  echo "Done! Your repo is live at: https://github.com/$GITHUB_USER/$REPO_NAME"
else
  echo ""
  echo "GitHub CLI (gh) not found. Install it from https://cli.github.com"
  echo ""
  echo "Then run these commands manually:"
  echo "  gh repo create $REPO_NAME --private --source=. --remote=origin --push"
  echo ""
  echo "Or use these git commands after creating the repo on github.com:"
  echo "  git remote add origin https://github.com/YOUR_USERNAME/$REPO_NAME.git"
  echo "  git push -u origin main"
fi
