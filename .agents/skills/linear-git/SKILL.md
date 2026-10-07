---
name: linear-git
description: "Git conventions for InvoiceTrackr: REK issue IDs, branch/commit/PR naming, and PR descriptions. Use for any branch, commit, push, or PR work in this repo."
---

# Git & Linear Workflow (InvoiceTrackr)

These are the repo's conventions. If you also have a personal
branch/commit/PR skill, use it for the mechanics, but these rules win in this
repo.

## Issues

Issues live in Linear under the team key **`REK`**, so IDs look like
`REK-123`. Merging a PR that references an issue closes it automatically;
no manual status updates are needed.

## Naming

| Thing | Format | Example |
| --- | --- | --- |
| Branch | `<type>/rek-<n>-<slug>` with `feat/`, `fix/`, `chore/`, `docs/` | `feat/rek-123-short-slug` |
| Commit | conventional with the ID as scope | `feat(REK-123): add client archiving` |
| PR title | `[REK-<n>] Imperative summary` | `[REK-123] Add client archiving` |
| Migration | `NNNN_rek_<n>_<slug>.sql` | `0047_rek_123_client_archiving.sql` |

Build branch names yourself from this table. Don't use Linear's suggested
`gitBranchName` (e.g. `rekojsx/rek-123-…`): never prefix a branch with a
username; always start with the change type (`feat/`, `fix/`, `chore/`,
`docs/`) and keep the slug short.

Several issues: `[REK-123, REK-124] …`. No issue given and none is
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
