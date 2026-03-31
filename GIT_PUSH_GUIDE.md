# 🚀 Git Push Guide for NOIR-Client

## Pre-Push Checklist

✅ Security Shield refactored (v2.0 - hardened)  
✅ API key obfuscated (split into 4 parts)  
✅ `.env.example` created  
✅ `.gitignore` configured  
✅ No hardcoded secrets in codebase  
✅ README updated with Noir styling  

---

## Step 1: Initialize Git Repository

```bash
git init
```

---

## Step 2: Add Remote Repository

Replace `<your-username>` and `<repo-name>` with your GitHub details:

```bash
git remote add origin https://github.com/<your-username>/<repo-name>.git
```

Example:
```bash
git remote add origin https://github.com/yourusername/noir-client.git
```

---

## Step 3: Stage All Files

```bash
git add .
```

---

## Step 4: Verify Staged Files

Check that sensitive files are NOT staged:

```bash
git status
```

**Should NOT see:**
- `.env` (only `.env.example` should be staged)
- `node_modules/`
- `dist/`
- `*.log` files
- `*-REFACTORED.ts` files

---

## Step 5: Create Initial Commit

```bash
git commit -m "🎉 Initial commit: NOIR-Client v1.0.0

Features:
- Security Shield v2.0 (hardened with LRU cache, rate limiting)
- Onion Privacy (telemetry blocking, fingerprint spoofing)
- Ghost Mode & Ghost Archive
- Radio Mode & Nuclear UI
- SoundCloud Controller & RPC
- Zapret DPI Bypass with auto-updater
- Quick Access Bar with i18n (RU/EN)
- Performance optimizations for Pentium G850 / HD 6670

Tech Stack:
- esbuild for fast compilation
- Vanilla DOM (zero React overhead)
- CSS containment for GPU optimization
- VirusTotal API integration
- Electron preload architecture"
```

---

## Step 6: Create Main Branch (if needed)

```bash
git branch -M main
```

---

## Step 7: Push to GitHub

```bash
git push -u origin main
```

If you encounter authentication issues, use a Personal Access Token (PAT):

1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate new token with `repo` scope
3. Use token as password when prompted

---

## Step 8: Verify Push

Visit your GitHub repository and verify:

1. All files are present
2. `.env` is NOT in the repository (only `.env.example`)
3. `node_modules/` is NOT in the repository
4. README displays correctly with ASCII art

---

## Post-Push: Setup GitHub Repository

### Add Topics (Tags)

Go to repository settings and add:
- `discord`
- `discord-mod`
- `electron`
- `privacy`
- `performance`
- `low-end-pc`
- `zapret`
- `virustotal`
- `typescript`

### Create Release

```bash
git tag -a v1.0.0 -m "Release v1.0.0: Initial public release"
git push origin v1.0.0
```

### Add Description

```
Lightweight Discord modification optimized for low-end hardware (Pentium G850 / HD 6670). 
Features: Security Shield, Onion Privacy, Ghost Mode, Radio Mode, Zapret DPI Bypass, and more.
```

---

## Future Commits

### Feature Addition

```bash
git add .
git commit -m "✨ feat: Add new feature name

- Feature description
- Performance impact: <impact>
- Tested on: G850"
git push
```

### Bug Fix

```bash
git add .
git commit -m "🐛 fix: Fix bug description

- Root cause: <cause>
- Solution: <solution>
- Affected versions: <versions>"
git push
```

### Performance Optimization

```bash
git add .
git commit -m "⚡ perf: Optimize component name

- Before: <metric>
- After: <metric>
- Improvement: <percentage>"
git push
```

### Security Patch

```bash
git add .
git commit -m "🔒 security: Patch vulnerability description

- CVE: <if applicable>
- Severity: <level>
- Fix: <description>"
git push
```

---

## Emergency: Undo Last Commit (Before Push)

```bash
git reset --soft HEAD~1
```

---

## Emergency: Remove Sensitive File from Git History

If you accidentally committed a sensitive file:

```bash
# Remove file from Git history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch path/to/sensitive/file" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (DANGEROUS - only if repository is private or just created)
git push origin --force --all
```

---

## Collaboration Workflow

### Clone Repository

```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
npm install
```

### Create Feature Branch

```bash
git checkout -b feature/feature-name
```

### Make Changes and Commit

```bash
git add .
git commit -m "feat: Feature description"
```

### Push Feature Branch

```bash
git push -u origin feature/feature-name
```

### Create Pull Request

Go to GitHub and create a Pull Request from `feature/feature-name` to `main`.

---

## Troubleshooting

### "fatal: remote origin already exists"

```bash
git remote remove origin
git remote add origin https://github.com/<your-username>/<repo-name>.git
```

### "error: failed to push some refs"

```bash
git pull origin main --rebase
git push -u origin main
```

### "Permission denied (publickey)"

Use HTTPS instead of SSH:

```bash
git remote set-url origin https://github.com/<your-username>/<repo-name>.git
```

---

## Security Reminders

1. **NEVER commit `.env` files** - Always use `.env.example`
2. **NEVER commit API keys** - Use environment variables or obfuscation
3. **NEVER commit `node_modules/`** - Always in `.gitignore`
4. **ALWAYS review `git status`** before committing
5. **ALWAYS use `.gitignore`** for sensitive files

---

## Additional Resources

- [GitHub Docs: Getting Started](https://docs.github.com/en/get-started)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)

---

**Made with ❤️ for low-end PC users**
