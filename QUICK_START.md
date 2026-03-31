# 🚀 Quick Start - NOIR-Client

## For First-Time GitHub Push

```bash
# 1. Initialize Git
git init

# 2. Add remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/noir-client.git

# 3. Stage all files
git add .

# 4. Verify what will be committed
git status

# 5. Create initial commit
git commit -m "🎉 Initial commit: NOIR-Client v1.0.0"

# 6. Set main branch
git branch -M main

# 7. Push to GitHub
git push -u origin main
```

---

## For Development

```bash
# Install dependencies
npm install

# Build project
npm run build

# Watch mode (development)
npm run dev

# Inject into Discord
node dist/injector.js
```

---

## Important Files

- **`.env.example`** - Copy to `.env` and add your VirusTotal API key
- **`GIT_PUSH_GUIDE.md`** - Detailed Git workflow guide
- **`GITHUB_PUSH_SUMMARY.md`** - Complete preparation summary
- **`README.md`** - Project documentation

---

## Security Checklist Before Push

- [ ] No `.env` file in repository (only `.env.example`)
- [ ] No `node_modules/` in repository
- [ ] No hardcoded API keys or secrets
- [ ] `.gitignore` is configured
- [ ] All sensitive data removed

---

## Need Help?

Read the full guides:
- `GIT_PUSH_GUIDE.md` - Step-by-step Git instructions
- `GITHUB_PUSH_SUMMARY.md` - What was changed and why
- `README.md` - Full project documentation

---

**Made with ❤️ for low-end PC users**
