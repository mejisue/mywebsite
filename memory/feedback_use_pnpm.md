---
name: Use pnpm for package management
description: This project uses pnpm, not npm. Always use pnpm run / pnpm add commands.
type: feedback
---

Always use `pnpm` instead of `npm` for all commands in this project.

**Why:** The front project uses pnpm (pnpm-lock.yaml exists), and the user explicitly corrected npm usage.

**How to apply:** Use `pnpm run build`, `pnpm add <pkg>`, `pnpm run dev`, etc. Never use `npm run` or `npm install` in this project.
