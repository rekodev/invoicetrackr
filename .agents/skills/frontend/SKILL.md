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
| Page spacing | Stacked sections `flex flex-col gap-5`; side-by-side cards/columns `grid gap-5` (`invoice-workspace.tsx`, `client-workspace.tsx`, dashboard) — same value both directions |
| Stat/metric cards | `MetricCard` (`components/ui/metric-card.tsx`) in `grid gap-5 sm:grid-cols-3`, one-line title, as in `client-workspace.tsx`, `expense-workspace.tsx` |
| Explaining a figure | Info tooltip: ghost/tertiary icon `Button` + `InformationCircleIcon` + `Tooltip` (`expense-workspace.tsx`, `invoice-services-heading.tsx`) |
| Section card | `Card className="border"`; `Card.Header className="flex-row flex-wrap items-center justify-between gap-4"` with `h2 text-base font-medium` (+ muted `text-sm` line) left and actions right |
| Section actions | Small `Button`/`buttonVariants` (`outline` or `secondary`, `size: 'sm'`) right-aligned in the header; never underlined text links |
| Data tables | Plain `<table>` with `thead text-muted border-b`, rows `border-b last:border-0`, amounts `text-right tabular-nums` (`client-workspace.tsx`); full lists use HeroUI `Table` (`invoice-table.tsx`) |
| Status / state labels | `Chip variant="soft"` with `color` (`danger` overdue, `success` paid, `accent` neutral), never coloured plain text |
| Warnings and notices | HeroUI `Alert status=…` (no custom colours): `Alert.Title` (general), `Alert.Description` with a lead-in line and a bulleted `list-disc` list when there are several points, and exactly **one** small action button on the right. When the points lead to different pages, the action is a `Review ▾` menu with one `Dropdown.Item href` per point (`dashboard/attention-strip.tsx`). On mobile the action moves under the text (`sm:hidden` / `hidden sm:block`) |
| Empty states | `EmptyState` with one clear next action |
| Key/value details | `dl` with `dt text-muted text-xs font-medium` / `dd text-sm` (`client-workspace.tsx`) |
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
- Loading states use skeletons from `components/ui/skeletons/`; empty
  states use `EmptyState` with a clear next action. Issue, void, and delete
  get a confirmation modal that says what can't be undone.

## Styling

- Use HeroUI components, `variant`s, and theme tokens (`text-muted`,
  `text-foreground`, `text-danger`, `text-success`, `bg-default`, `border`) so light/dark
  works automatically. Avoid raw palette colours (`text-gray-500`,
  `bg-blue-600`), custom gradients, or ad-hoc backgrounds.
- Prefer the component's built-in look; add only layout utilities
  (`flex`, `gap-4`, `grid`, responsive breakpoints) via `className`.

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

## Accessibility

React Aria (under HeroUI) handles most semantics; you still need visible
`Label`s, `aria-label` on icon-only buttons, and real buttons/links for
actions. E2E tests select by role and accessible name, so good labels keep
them stable.

## Tests

Use the **testing** skill (component tests with `withIntl` and mocked
actions; extend the component's existing test file).
