# 📤 GitHub Push Commands - Quick Reference

## Initial Setup

```bash
# Initialize Git repository
git init

# Add remote repository
git remote add origin https://github.com/dorksuser/Savecord.git

# Verify remote
git remote -v
```

---

## Stage and Commit

```bash
# Stage all files
git add .

# Verify what will be committed
git status

# Create initial commit
git commit -m "🎉 Initial release: Savecord v1.0.0"
```

---

## Push to GitHub

```bash
# Set main branch
git branch -M main

# Push to remote
git push -u origin main
```

---

## Create Release Tag

```bash
# Create annotated tag
git tag -a v1.0.0 -m "Release v1.0.0: Initial public release"

# Push tag to remote
git push origin v1.0.0
```

---

## Verify Push

```bash
# Check remote branches
git branch -r

# Check tags
git tag -l

# View commit history
git log --oneline
```

---

## Troubleshooting

### Authentication Failed

**Option 1: Use Personal Access Token (PAT)**
1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate new token with `repo` scope
3. Use token as password when prompted

**Option 2: Use SSH**
```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"

# Add SSH key to GitHub
cat ~/.ssh/id_ed25519.pub

# Change remote to SSH
git remote set-url origin git@github.com:dorksuser/Savecord.git
```

### Push Rejected (Non-Fast-Forward)

```bash
# Pull with rebase
git pull origin main --rebase

# Push again
git push -u origin main
```

### Wrong Remote URL

```bash
# Remove existing remote
git remote remove origin

# Add correct remote
git remote add origin https://github.com/dorksuser/Savecord.git
```

---

## Future Updates

### Feature Branch Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "✨ feat: Add new feature"

# Push feature branch
git push -u origin feature/new-feature

# Create Pull Request on GitHub
# After merge, update main
git checkout main
git pull origin main
```

### Hotfix Workflow

```bash
# Create hotfix branch
git checkout -b hotfix/critical-bug

# Fix and commit
git add .
git commit -m "🐛 fix: Fix critical bug"

# Push hotfix
git push -u origin hotfix/critical-bug

# Merge to main
git checkout main
git merge hotfix/critical-bug
git push origin main

# Tag hotfix release
git tag -a v1.0.1 -m "Hotfix v1.0.1"
git push origin v1.0.1
```

---

## Commit Message Conventions

Use conventional commits for better changelog generation:

```bash
# Features
git commit -m "✨ feat: Add new plugin"

# Bug fixes
git commit -m "🐛 fix: Fix memory leak"

# Performance improvements
git commit -m "⚡ perf: Optimize rendering"

# Security patches
git commit -m "🔒 security: Patch XSS vulnerability"

# Documentation
git commit -m "📝 docs: Update README"

# Refactoring
git commit -m "♻️ refactor: Restructure plugin system"

# Tests
git commit -m "✅ test: Add unit tests"

# Build system
git commit -m "👷 build: Update esbuild config"
```

---

## Pre-Push Checklist

Before every push, verify:

- [ ] `.env` is NOT staged (check with `git status`)
- [ ] `node_modules/` is NOT staged
- [ ] `dist/` and `build/` are NOT staged
- [ ] `.kiro/` is NOT staged
- [ ] No hardcoded API keys in source files
- [ ] Build succeeds (`npm run build`)
- [ ] No TypeScript errors
- [ ] Commit message follows conventions

---

## Quick Commands

```bash
# One-liner: Stage, commit, and push
git add . && git commit -m "Update" && git push

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# View changes before staging
git diff

# View staged changes
git diff --staged

# Amend last commit message
git commit --amend -m "New message"

# Force push (DANGEROUS - use only if necessary)
git push --force origin main
```

---

**Made with ❤️ for low-end PC users**
