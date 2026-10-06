---
name: linear-git
description: "Interacting with Linear for InvoiceTrackr: issues, the roadmap, and REK naming for branches, commits, and PRs. Use with create-pr for any Linear, branch, commit, or PR work."
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
  explicitly confirms, and update the roadmap checklist if relevant.
- PR auto-linking needs the Linear GitHub integration; without it, IDs in
  titles are plain-text references (still include them).

## Naming

| Thing | Format | Example |
| --- | --- | --- |
| Branch | `<type>/rek-<n>-<slug>` with `feat/`, `fix/`, `chore/`, `docs/` | `feat/rek-117-expense-workspace` |
| Commit | conventional with the ID as scope | `feat(REK-170): add VMI company lookup` |
| PR title | `[REK-<n>] Imperative summary` | `[REK-48] Add invoice domain foundation` |
| Migration | `NNNN_rek_<n>_<slug>.sql` | `0046_rek_83_client_workspace.sql` |

Several issues: `[REK-95, REK-96, REK-97] …`. Put the IDs in the PR's
`### Overview` text too.
