---
name: frontend
description: "InvoiceTrackr client conventions: server vs client components, server actions, feedback and UI states, styling, and splitting features into files. Use for any UI work in client/."
---

# InvoiceTrackr Frontend

Use alongside **heroui-react** — that skill documents HeroUI v3 component
APIs (fetch its docs when unsure of a prop); this one documents how this app
uses them. Match the closest existing screen before inventing structure.
Good references: `components/client/client-form-dialog.tsx` (form dialog, see **forms**),
`components/client/client-workspace.tsx` (overview: cards + metrics),
`components/reports/taxes/taxes-workspace.tsx` (task page: open sections, status chip, compact header toolbar),
`app/(user)/clients/[clientId]/page.tsx` (server page),
`components/company-lookup/company-lookup-panel.tsx` (interactive widget).

## Spacing tokens

`client/src/app/globals.css` owns the semantic Tailwind v4 `@theme` spacing
tokens. Use these utilities for their stated purpose instead of repeating
numeric gaps or adding local spacing workarounds. The same values apply on
mobile; columns and action rows stack or wrap when needed.

| Purpose | Utility | Value |
| --- | --- | --- |
| Page gutter and heading-to-first-content gap | `p-page`, `gap-section` | 24px |
| Reserved page heading row | `min-h-page-heading` | 40px |
| Between sections, panels, or cards in a grid | `gap-section` | 24px |
| Section heading to its content | `gap-heading` | 12px |
| Between form fields | `gap-field` | 16px |
| Label, control, helper/error, or short related text | `gap-field-content` | 4px |
| Card, dialog, and informational-popover content gutter | `p-card` | 16px |
| Last field to form action row | `gap-form-actions`, `pt-form-actions` | 16px |
| Between buttons or an inline icon and label | `gap-actions` | 8px |

The `workspace-ui` shell class activates scoped HeroUI spacing defaults,
including dialogs and popovers rendered through portals. Keep all padding on
the card itself: `Card.Header`, `Card.Content`, and `Card.Footer` normally
have no additional padding. Use `Card.Header` for a settings section title,
`Card.Content className="gap-field"` for its fields, and `Card.Footer` for
actions. The scoped card footer rule produces a 16px action gap; modal
header/body and body/footer spacing use the heading and form-action tokens.

Render helper and validation messages only when present. Do not reserve an
empty message line or use negative margins to position helper text. Put
field descriptions inside their owning field so the 4px gap applies.

Deliberate exceptions: edge-to-edge PDF/document viewers and divided record
lists may use `p-0` on the outer surface, with one `p-card` gutter on their
header/content/rows. Table cells, icon hit areas, focus-ring clearance,
scroll containers, and embedded chart/PDF dimensions retain their component
spacing; they are not section or field gaps. Match loading placeholders to
the corresponding loaded layout, including the reserved heading row.

## Logged-in heading hierarchy

- **Page title:** one `PageHeader` with `h1 text-lg font-semibold` — 18px.
- **Page spacing:** the shared logged-in layout has 24px top padding
  (`p-page`). Every page stacks its heading and first content with `gap-section`
  (24px). `PageHeader` reserves a 40px row (`min-h-page-heading`) and vertically
  centers the title and actions, including on pages without actions.
  With the 28px title line height, this leaves 30px of visible space above
  and below the text on a single-row header. Content panels keep their
  24px gaps. Page-level buttons and button-like links use `size="md"`;
  header filters use compact controls with accessible labels and fit within
  that row.
  On narrow screens controls can wrap into additional 40px rows. Record
  metadata follows the heading row as content. Loading skeletons reserve
  the same heading height and gap (`PageHeaderSkeleton`).
- **Section title:** `h2 text-base font-medium` — 16px. Nested `h3`/`h4`
  headings keep the same 16px size. `SectionHeading` defaults to `h2` and
  enforces this size for each supported heading level.
- **Section header layout:** title, optional small soft count `Chip`, then
  an optional concise statistic in one wrapping, vertically centered row.
  Actions sit on the right. Example: Overdue Invoices → count chip → amount
  overdue. Explanatory content belongs in an `InfoPopover` beside the title;
  section headings have no description underneath. Omit redundant context
  such as a year already selected in the page controls.
- **Settings cards:** begin with a meaningful 16px section heading that
  names the task or details, without repeating the page title or adding an
  introductory description: Profile → Business Details; Payment Methods →
  Default Bank Account; Invoice Defaults → New Invoice Settings; Password →
  Change Password. Account keeps Language and Your Data as distinct sections.
  Page-level actions such as Add New belong in `PageHeader`.

This rule governs content headings across the logged-in app, including
dashboard, reports, record workspaces, and settings. Field help, empty-state
guidance, alerts, confirmations, and record metadata retain their own purpose.

## Consistent building blocks, layout chosen per page

Keep the **building blocks** the same everywhere: the same HeroUI
components, theme tokens, spacing scale, chips, alerts, tooltips, headers,
empty states and copy structure. Don't keep the **layout** the same
everywhere. Choose it for the page's job:

| Page job | Layout |
| --- | --- |
| Overview: "how am I doing?" (dashboard, client or expense overview) | A `MetricCard` row is fine, then cards for the details |
| Task or report: "get something done or read it off" (taxes, journal) | No stat cards. Header controls, a status chip if needed, an Alert only for things with an action, then open sections (cardless lists and tables); cards only where a side-by-side comparison reads better |
| Detail of one record (client, expense, invoice) | Header with actions, key/value `dl`, then the record's lists |
| Form or dialog | See **forms** |

A page made only of identical bordered cards is a smell. Before adding a card
or a stat row, ask whether the content is a figure to watch (card), a list to
read (open section or table), or a state (chip). Prefer HeroUI's own variants
over custom styling when you need contrast: `Card variant="transparent"`/
`secondary`, `Table variant="secondary"`, `Toolbar isAttached`,
`ButtonGroup`.

Before building any section, chip, table, alert, tooltip, header, or empty
state:

1. **Find the closest existing instance.** Search with `rg` for the
   component or similar copy. Use the catalog below first.
2. **Reuse its building blocks.** Same component, variants, tokens, spacing
   and copy structure. Arrange them for this page's job (table above).
3. **Prefer the shared component.** If the same markup already appears on
   two or more pages, extract it to `components/ui/` and use it from both,
   rather than adding a third copy.
4. **New patterns are allowed when they fit the page better.** Use HeroUI
   components and tokens, say so in the handoff, and add a row to the
   catalog below in the same change.

Don't add page-specific styling outside the design system: no ad-hoc
colours, custom paddings, stacked label/subtitle variants, or underlined
inline action links when an established pattern exists.

| Need | Existing pattern |
| --- | --- |
| Page spacing | Layout `p-page` (24px) → `PageHeader` row → `gap-section` (24px) → first content. The row is 40px only when it holds actions; a title-only header is just the 28px title. Skeletons use `PageHeaderSkeleton` (`hasActions={false}` for title-only pages). Stacked sections and card grids use `gap-section`; section heading → content uses `gap-heading` (12px). List pages stack toolbar → count line → list → pager with `gap-field` (16px) (`invoice-table.tsx`, `client-section.tsx`, `expense-table.tsx`) |
| Card padding | Workspace cards get `--spacing-card` (20px) from `globals.css`; don't add padding utilities to a card. Split-section cards use `p-0` with `p-card` on their parts. A form inside a card puts `card-form-fields` on its content (12px indent, and 20px below the card title so the title reads as a heading) and `px-form-inset` on its footer (`change-password-form.tsx`) |
| Stat/metric cards | `MetricCard` (`components/ui/metric-card.tsx`) in `grid gap-section sm:grid-cols-3`, one-line title; the dashboard row has four (`sm:grid-cols-2 lg:grid-cols-4`). Its label/value gap is `gap-heading`, without extra margins. A figure that needs its calculation keeps the card compact and puts the breakdown in an `InfoPopover` (`safe-to-spend-card.tsx`) |
| Explaining a figure | Info tooltip for one or two hover sentences: `InfoTooltip` (`components/ui/info-tooltip.tsx`), also for long form-field hints next to the `Label` instead of a `Description` (`tax-assumptions-dialog.tsx`). Older inline copies: `expense-workspace.tsx`, `invoice-services-heading.tsx`. Anything with a list or a link goes in `InfoPopover` instead, since tooltip content can't be clicked |
| Section guide or disclaimer | `InfoPopover` (`components/ui/info-popover.tsx`) next to the section title: click-to-open info icon for longer help, lists, or source links. Don't add a separate guide card or page-level `Alert` (`journal-table.tsx`, `tax-method-comparison.tsx`). Near the right edge pass `placement="bottom end"` so it opens leftwards (`safe-to-spend-card.tsx`). All popover text, including a lead-in sentence under the title, uses the default foreground color; the bold title carries the hierarchy. `text-muted` is only for a short description under a bold name (`annual-package-download.tsx`) |
| Page header | Every logged-in page (not onboarding or verify-email) starts with the shared `PageHeader` (`components/ui/page-header.tsx`): a 40px row when it has actions, `h1 text-lg font-semibold` left, medium (`size="md"`) page-level actions right. Header toolbars fit within 40px (`bg-transparent p-0` on the attached taxes toolbar, so it sits on the page background). Record metadata follows the row as content (`invoice-workspace.tsx`). Render it in the server page outside `Suspense` so the title doesn't wait on data. List pages put their primary actions (Add New) here; don't repeat links to pages the sidebar already lists; table toolbars keep search and filters. A dialog action uses a small client component that owns the dialog (`add-client-button.tsx`). Titles reuse the `breadcrumbs.*` label or the form's existing title key |
| Navigation | No in-page tabs for pages the sidebar already lists. Each sidebar child is its own route, and the group's index route redirects to its first child (`reports/page.tsx` → `/reports/journal`) |
| Section heading | `h2 text-base font-medium` (16px); `SectionHeading` provides the same style for `h2`/`h3`/`h4`. A single-card section keeps its heading and actions in `Card.Header` (`tax-assumptions-card.tsx`); a section with several cards puts the heading above the cards (`tax-method-comparison.tsx`). Help goes in an `InfoPopover`, with no description below the heading |
| Settings page heading | `PageHeader` supplies the 18px page title and medium page-level actions (`settings/payment-methods/page.tsx`). Cards begin with a 16px `SectionHeading` that names their task or details, such as Business Details, Default Bank Account, New Invoice Settings, or Change Password. Account keeps Language and Your Data as distinct sections. One card per settings page, with no introductory description or repeated page title |
| Full-page status | `StatusMessage` (`components/ui/status-message.tsx`): tinted icon, `h1`, muted description, one ghost action. Used by `error.tsx`, `unauthorized.tsx` and the in-shell `RateLimitNotice` |
| Empty states | `EmptyState` with at most two next actions; each keeps its icon (`PlusIcon` for create/add) and the same casing (`journal-workspace.tsx`) |
| List count | Small `Chip variant="soft"` after the section title, followed by an optional inline statistic; title, count and statistic wrap together (`journal-table.tsx`, `dashboard/overdue-invoices.tsx`) |
| Interactive client cards | Use the surface hover token for card hover/focus, with a transition. Nested edit actions must remain visibly distinct on the hovered card (`client/client-section.tsx` uses the button hover variable with `--default-hover`). Keep business and VAT identifiers in the full-width metadata row; group any separator with the following identifier so wrapping never leaves a dangling dot (`client-card.tsx`) |
| Compact header filters | Give filters accessible labels without an extra visible label row; vertically center trigger contents with `items-center py-0` and keep their height within the reserved 40px page heading row (`reports/journal-filters.tsx`, `reports/year-select.tsx`) |
| Section card | `Card className="border"` owns the 20px padding and 12px header/content gap. `Card.Header className="flex-row flex-wrap items-start justify-between gap-field"` keeps `h2 text-base font-medium` left and small (`size="sm"`) actions right; the actions take `-my-1` so they center on the title line without pushing the title below the card padding (`client-workspace.tsx`). Title, count chip, inline statistic and info trigger use `flex flex-wrap items-center gap-actions`; no stacked description (`journal-table.tsx`) |
| Section actions | Small `Button`/`buttonVariants` (`outline` or `secondary`, `size: 'sm'`) right-aligned in the header; never underlined text links |
| Open sections | Report and task pages can use cardless sections: `h2` (+ `InfoPopover`) above a `dl` with `border-y` and row dividers. Use `gap-heading` within a section and `gap-section` between sections (`annual-package-figures.tsx`, `taxes-workspace.tsx`). An empty open section keeps its heading and puts the `EmptyState` inside the same `border-y`, with no rounded border (`tax-setup-prompt.tsx`). The page's main download sits in `PageHeader` with a compact year select in `Toolbar isAttached className="bg-transparent p-0 shadow-none"`, a vertical `Separator`, and a medium primary button. Help uses a joined icon segment in `ButtonGroup` (`InfoPopover buttonVariant="primary" buttonSize="md"`) |
| Data tables | Plain `<table>` with `thead text-muted`, row dividers, amounts `text-right tabular-nums` (`client-workspace.tsx`); full lists use HeroUI `Table` (`invoice-table.tsx`). A total row is a rounded `bg-default` row like the estimated-total block on tax cards: use `border-separate border-spacing-0`, put borders on cells, and round the first/last footer cells (`journal-table.tsx`) |
| Status / state labels | `Chip variant="soft"` with `color` (`danger` overdue, `success` paid, `accent` neutral), never coloured plain text |
| Warnings and notices | HeroUI `Alert status=…` (no custom colours): `Alert.Title` (general), `Alert.Description` with a lead-in line and a bulleted `list-disc` list when there are several points, and exactly **one** small action button on the right. Descriptions use the regular foreground color (overridden once in `globals.css`); the status icon and colored title carry the severity. When the points lead to different pages, the action is a `Review ▾` menu with one `Dropdown.Item href` per point (`dashboard/attention-strip.tsx`). On mobile the action moves under the text (`sm:hidden` / `hidden sm:block`). Keep one severity per Alert, and use Alerts only for points with an action (`reports/annual/annual-package-checks.tsx`). A page-level state without its own action (e.g. not final / ready) is a `size="md"` soft `Chip` (`gap-2`) after the page title (`PageHeader titleAddon`) with an `InformationCircleIcon` inside; the chip is the `InfoPopover` `trigger` and the popover explains the state (`reports/annual/annual-package-status-chip.tsx`) |
| Key/value details | `dl` with `dt text-muted text-xs font-medium` / `dd text-sm` (`client-workspace.tsx`) |
| Labels and qualifiers | Casing by text type (Title Case names, sentence-case sentences in English) and inline ` · ` qualifiers instead of extra headings or subtitles. See **i18n** |
| Money and dates | `formatMoney` (`lib/utils/currency.ts`), `formatLocalizedDate` (`lib/utils/date.ts`) |

When you add or settle a pattern that other pages should follow, add a row
to this table in the same change.

## Layout of `client/src`

- `app/` — routes. `(user)` = authenticated app, `(auth)` = login/sign-up.
  Quote these paths in zsh: `'client/src/app/(user)/clients/page.tsx'`.
- `components/<domain>/` — feature components; `components/ui/` — shared
  primitives (`EmptyState`, `MetricCard`, `IconContainer`, skeletons).
- `api/` — axios wrappers per domain; `lib/actions/` — `'use server'`
  actions; `lib/constants/pages.ts` — route constants; `lib/utils/` helpers.

## Splitting a feature into files

Where each piece of a feature goes:

- UI pieces → `components/<domain>/` (one component per file; extract
  sub-components when a file mixes several concerns).
- Stateful/reusable logic → `lib/hooks/`.
- Pure logic (mappers, calculations, formatting, form defaults) →
  `lib/utils/<domain>.ts`.
- Static options, limits, keys → `lib/constants/<domain>.ts`.
- Local types → `lib/types/` (shared API shapes stay in `@invoicetrackr/types`).
- Server calls → `api/<domain>.ts` + `lib/actions/<domain>.ts`.

## Server first

- Pages are async server components. Authenticate with `await auth()` and
  `unauthorized()`, validate route params, call `api/` read functions, map a
  404 to `notFound()`, throw on other errors so `error.tsx` handles it, then
  pass data down.
- Wrap slow content in `<Suspense fallback={<XSkeleton />}>` using a
  skeleton from `components/ui/skeletons/`; routes may also have
  `loading.tsx`.
- Server components use `getTranslations('ns')` from `next-intl/server`;
  client components use `useTranslations('ns')`.

## Mutations

Client components call a server action from `lib/actions/<domain>.ts`
(which calls `api/`, maps errors, and `revalidatePath`s) — never `api/`
directly. Actions return `ActionResponseModel`
(`{ ok, message, code?, validationErrors?, data? }`); show `message` in a
`toast` with `variant: ok ? 'success' : 'danger'`. Server messages are
already translated. If the backend endpoint doesn't exist yet, use the
**fastify-endpoint** skill.

## Forms

All forms use React Hook Form with HeroUI fields — follow the **forms**
skill (field wrappers, defaults/reset, server validation errors, submit
states, and form tests).

## Dialogs, feedback, states

- Modals use the compound API: `Modal.Backdrop` (owns `isOpen` /
  `onOpenChange`) → `Modal.Container` → `Modal.Dialog` → `Modal.Header` /
  `Modal.Body` / `Modal.Footer`, with `Modal.CloseTrigger` (form dialogs:
  see **forms**).
- Feedback: `toast(message, { variant })` from `@heroui/react`; inline
  persistent warnings with `Alert`.
- Loading states use skeletons from `components/ui/skeletons/` that mirror
  the loaded layout at every breakpoint (same stack gaps, same column
  count, full width); empty states use `EmptyState` with a clear next
  action. Issue, void, and delete
  get a confirmation modal that says what can't be undone.

## Styling

- Use HeroUI components, `variant`s, and theme tokens (`text-muted`,
  `text-foreground`, `text-danger`, `text-success`, `bg-default`, `border`) so light/dark
  works automatically. Avoid raw palette colours (`text-gray-500`,
  `bg-blue-600`), custom gradients, or ad-hoc backgrounds.
- Prefer the component's built-in look; add only layout utilities
  (`flex`, `gap-4`, `grid`, responsive breakpoints) via `className`.

## HeroUI version

The installed `@heroui/react` version (see `client/package.json`) can
differ from the online docs and the **heroui-react** skill. Before using a
compound component (`Radio`, `Checkbox`, `Select`, `Popover`, `Accordion`),
copy its anatomy from existing code in this repo, or check the installed
typings in `node_modules/@heroui/react/dist/components/<name>`. Some slots
carry default padding (e.g. `Accordion.Body` adds `px-4 pb-4`); override
it explicitly when the component is used for layout such as sidebar
submenus.

## Copy and locale

- All user-facing text goes through next-intl with keys in **both**
  `client/messages/en.json` and `client/messages/lt.json` (see the
  **i18n** skill). Lithuanian is the primary audience; never ship
  English-only strings or hard-coded text.
- Dates: use `lib/utils/date.ts` (`formatLocalizedDate`,
  `todayInLithuania` for "today" defaults — not `new Date()` in UTC).
  Money: `formatMoney` (`lib/utils/currency.ts`); never `toFixed` for
  display.

## Check before handoff

Look at the result in a browser before handing UI work back. Most visual
review comments are things a quick look catches:

- Open every new or moved route. Check the breadcrumb (each path segment
  needs a `breadcrumbs.<segment>` key) and the active sidebar item.
- Switch to the other locale: no raw keys, and Lithuanian text fits.
- Check a narrow width: headers and grids wrap cleanly, and controls stay
  next to their headings.
- Throttle or reload to see the skeleton; it should match the loaded layout.
- Buttons in one row share size, variant, icon style and casing.
- Exercise every state you touched: empty, error, validation, saving.

## Accessibility

React Aria (under HeroUI) handles most semantics; you still need visible
`Label`s, `aria-label` on icon-only buttons, and real buttons/links for
actions. E2E tests select by role and accessible name, so good labels keep
them stable.

## Tests

Use the **testing** skill (component tests with `withIntl` and mocked
actions; extend the component's existing test file).
