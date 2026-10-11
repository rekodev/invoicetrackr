---
name: frontend
description: "InvoiceTrackr client conventions: server vs client components, server actions, feedback and UI states, styling, and splitting features into files. Use for any UI work in client/."
---

# InvoiceTrackr Frontend

Use alongside **heroui-react** — that skill documents HeroUI v3 component
APIs (fetch its docs when unsure of a prop); this one documents how this app
uses them. Match the closest existing screen before inventing structure.
Good references: `components/client/client-form-dialog.tsx` (form dialog, see **forms**),
`components/client/client-workspace.tsx` (cards + metrics),
`app/(user)/clients/[clientId]/page.tsx` (server page),
`components/company-lookup/company-lookup-panel.tsx` (interactive widget).

## Reuse existing patterns (required)

The app should look and behave the same on every page. Before building any
section, card, table, alert, chip, tooltip, header, or empty state:

1. **Find the closest existing instance.** Search with `rg` for the
   component or similar copy. Use the catalog below first.
2. **Reuse it as-is.** Use the same component, variants, class names,
   spacing, and copy structure. A new page is not a reason for a new look.
3. **Prefer the shared component.** If the same markup already appears on
   two or more pages, extract it to `components/ui/` and use it from both,
   rather than adding a third copy.
4. **Introduce a new pattern only when nothing fits.** Say so explicitly
   in the handoff, and say why the existing patterns didn't work.

Don't invent page-specific styling: no ad-hoc colours, custom paddings,
stacked label/subtitle variants, or underlined inline action links when an
established pattern exists.

| Need | Existing pattern |
| --- | --- |
| Page spacing | Stacked page sections (page header, panels, card groups) `flex flex-col gap-6` (24px), the same value for the skeleton; side-by-side cards/columns `grid gap-5` (`reports/taxes/page.tsx`, `tax-estimate-workspace.tsx`). Section heading → its content `gap-3` |
| Stat/metric cards | `MetricCard` (`components/ui/metric-card.tsx`) in `grid gap-5 sm:grid-cols-3`, one-line title (`expense-table.tsx`, `client-workspace.tsx`); the dashboard row has four (`sm:grid-cols-2 lg:grid-cols-4`). A figure that needs its calculation keeps the card compact and puts the breakdown in an `InfoPopover` (`safe-to-spend-card.tsx`) |
| Explaining a figure | Info tooltip for one or two hover sentences: ghost/tertiary icon `Button` + `InformationCircleIcon` + `Tooltip` (`expense-workspace.tsx`, `invoice-services-heading.tsx`). Anything with a list or a link goes in `InfoPopover` instead, since tooltip content can't be clicked |
| Section guide or disclaimer | `InfoPopover` (`components/ui/info-popover.tsx`) next to the section title: click-to-open info icon for longer help, lists, or source links. Don't add a separate guide card or page-level `Alert` (`journal-table.tsx`, `tax-method-comparison.tsx`). Near the right edge pass `placement="bottom end"` so it opens leftwards (`safe-to-spend-card.tsx`) |
| Page header | `PageHeader` (`components/ui/page-header.tsx`): left group with `h1 text-xl font-semibold` and an optional one-line muted description, page-level controls (filters, year select) right, vertically centered (`reports/journal/page.tsx`, `reports/taxes/page.tsx`). Provisional until REK-171 |
| Navigation | No in-page tabs for pages the sidebar already lists. Each sidebar child is its own route, and the group's index route redirects to its first child (`reports/page.tsx` → `/reports/journal`) |
| Section heading | A single-card section keeps its `h2` and actions in `Card.Header` (`tax-assumptions-card.tsx`); a section with several cards puts the `h2` above the cards (`tax-method-comparison.tsx`). Don't repeat context the page controls already show (e.g. the selected year) |
| Empty states | `EmptyState` with at most two next actions; each keeps its icon (`PlusIcon` for create/add) and the same casing (`journal-workspace.tsx`) |
| List count | Small `Chip variant="soft"` after the section title, not ` · {count}` in the title (`journal-table.tsx`) |
| Section card | `Card className="border"`; `Card.Header className="flex-row flex-wrap items-center justify-between gap-4"` with `h2 text-base font-medium` left and actions right. When the title has a muted `text-sm` line under it, use `items-start` so the actions sit as far from the top edge as from the right (`journal-table.tsx`) |
| Section actions | Small `Button`/`buttonVariants` (`outline` or `secondary`, `size: 'sm'`) right-aligned in the header; never underlined text links |
| Data tables | Plain `<table>` with `thead text-muted`, row dividers, amounts `text-right tabular-nums` (`client-workspace.tsx`); full lists use HeroUI `Table` (`invoice-table.tsx`). A total row is a rounded `bg-default` row like the estimated-total block on tax cards: use `border-separate border-spacing-0`, put borders on cells, and round the first/last footer cells (`journal-table.tsx`) |
| Status / state labels | `Chip variant="soft"` with `color` (`danger` overdue, `success` paid, `accent` neutral), never coloured plain text |
| Warnings and notices | HeroUI `Alert status=…` (no custom colours): `Alert.Title` (general), `Alert.Description` with a lead-in line and a bulleted `list-disc` list when there are several points, and exactly **one** small action button on the right. When the points lead to different pages, the action is a `Review ▾` menu with one `Dropdown.Item href` per point (`dashboard/attention-strip.tsx`). On mobile the action moves under the text (`sm:hidden` / `hidden sm:block`) |
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
  Money: `Intl.NumberFormat` with the active locale and the invoice
  currency, as in `components/dashboard/latest-invoices.tsx`; never
  `toFixed` for display.

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
