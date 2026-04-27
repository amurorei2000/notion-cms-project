---
name: Project Tech Stack
description: Full technology stack choices for the notion-cms-blog project
type: project
---

This is an LLM study team blog powered by Notion as a CMS.

**Stack decisions:**
- Framework: Next.js 16.2.4 (App Router, no `src/` directory — all source at project root)
- Language: TypeScript (strict mode, noUnusedLocals, noUnusedParameters)
- CSS: Tailwind CSS v4 (no tailwind.config.js — config is CSS-only in globals.css)
- UI Components: shadcn/UI (components.json configured, Radix-based)
- Icons: Lucide React (primary) + Phosphor Icons (shadcn default icon library per components.json)
- State management: None — server components only
- CMS/DB: Notion API via `@notionhq/client` v5 (dataSources.query — NOT databases.query which was v2/v3)
- Package manager: pnpm (never use yarn or npm)
- Theme: next-themes with system default, dark mode via CSS variables
- Toasts: sonner
- Animations: tw-animate-css
- Deployment: undecided

**Notion API v5 breaking change (important):**
`notion.databases.query` was removed in v5. Use `notion.dataSources.query({ data_source_id: DATABASE_ID })` instead.
`pages.create` still accepts `parent: { database_id: ... }` for backward compat.

**Notion DB schema:**
- StudyTitle (title property)
- Writer (rich_text)
- StudyNote (rich_text)
- StudyRef (url)
- StudyImg (url)

**Why:** PRD specifies this stack; Tailwind v4 and Notion CMS are the primary architectural choices.
**How to apply:** Always use pnpm, always use dataSources.query for DB queries, respect no-src-dir convention.
