---
name: linear-git
description: "Linear and Git conventions for InvoiceTrackr: issues, the roadmap, branch/commit/PR naming, and PR descriptions. Use for any Linear, branch, commit, push, or PR work in this repo."
---

# Git & Linear Workflow (InvoiceTrackr)

These are the repo's conventions. If you also have a personal
branch/commit/PR skill, use it for the mechanics, but these rules win in this
repo.

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

Several issues: `[REK-95, REK-96, REK-97] …`. No issue given and none is
obvious from the branch or diff: don't invent one; use a clean title and
commit message without an ID.

## Commits and pull requests

- Branch from `main` when starting from it; don't push to the branch of an
  already merged PR.
- Stage only the files that belong to the change, and keep unrelated fixes
  out unless they're listed under `### Additional changes`.
- Open PRs against `main` (the authenticated `gh` CLI works if a GitHub
  connector can't).

PR description shape:

```markdown
### Overview

Short summary of the problem and resulting behaviour, with the REK ID(s).

- Key change
- Important UI, API, or workflow impact

### Visual demonstration

Only for user-visible changes: a focused screenshot or short recording.

### Additional changes

- Only for intentional ride-along fixes.
```

Don't add validation notes (test plans, lint/typecheck/build results,
skipped checks) or a separate `Refs` section; CI and reviewers own
validation, and issue IDs belong in the overview.
