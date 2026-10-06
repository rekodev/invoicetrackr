---
name: linear-git
description: "Interacting with Linear and Git for InvoiceTrackr: issues, roadmap, branch/commit/PR naming, and PR descriptions. Use with create-pr for any Linear, branch, commit, or PR work."
---

# Git & Linear Workflow (InvoiceTrackr)

The general branch → commit → push → PR mechanics, safety checks, and visual
evidence rules live in the **create-pr** skill; follow it. This skill adds
the InvoiceTrackr-specific Linear and naming rules.

## Linear

- Workspace `rekodev`, project **InvoiceTrackr**, team key **`REK`**.
  Issue IDs come from the team key (`REK-123`), not the project name.
- Source of truth for MVP ordering, scope, checklist state, and post-MVP
  backlog: the Linear document **Freelancer Finance MVP Roadmap**
  (`ae430e3e-e7bc-4817-b042-a858ad336e28`). Read it before answering "what
  is next", changing roadmap scope, or updating issue status. Local dated
  audit docs are stale unless the live roadmap confirms them.
- Use the direct Linear connector (`mcp__linear`) for live reads/writes when
  available; app-proxied Linear connectors can be stale or need
  reauthentication. If no Linear tool is available, say so instead of
  guessing roadmap state.
- Move an issue to **Done** only after its PR is merged or the user
  explicitly confirms.
- PR auto-linking needs the Linear GitHub integration; without it, IDs in
  titles are plain-text references (still include them).

## Naming

| Thing | Format | Example |
| --- | --- | --- |
| Branch | `<type>/rek-<n>-<slug>` with `feat/`, `fix/`, `chore/`, `docs/` | `feat/rek-117-expense-workspace` |
| Commit | conventional with the ID as scope | `feat(REK-170): add VMI company lookup` |
| PR title | `[REK-<n>] Imperative summary` | `[REK-48] Add invoice domain foundation` |
| Migration | `NNNN_rek_<n>_<slug>.sql` | `0046_rek_83_client_workspace.sql` |

Several issues: `[REK-95, REK-96, REK-97] …`. No issue given and none is
obvious from the branch/diff: don't invent one — ask, or use a clean title
without an ID.

## PR description

- Start with `### Overview`: a short summary that mentions the issue ID,
  then bullet points of the key changes.
- Optional `### Visual demonstration` (per create-pr) and
  `### Additional changes` for intentional ride-along fixes.
- Do **not** add `Validation:`, `Refs`, test plans, typecheck/lint/build
  results, migration-journal, locale-JSON, whitespace-check, or
  skipped-check notes. CI and reviewers own validation visibility; report
  verification to the user in chat instead.

## Flow

1. Implement, then stop and tell the user the change is ready for local
   review/testing. Don't commit or open a PR until they ask.
2. On a publish request, check `gh auth status` early. If a GitHub
   connector write fails, use the authenticated local `gh` CLI.
3. Follow create-pr for branching from `main`, staging only intended files,
   pushing, and creating the PR with the naming above.
4. After merge (or explicit confirmation), update the Linear issue and, if
   relevant, the roadmap checklist.
