---
name: frontend
description: "InvoiceTrackr client conventions: server vs client components, server actions, HeroUI forms, feedback and UI states, styling, and splitting features into files. Use for any UI work in client/."
---

# InvoiceTrackr Frontend

Use alongside **heroui-react** — that skill documents HeroUI v3 component
APIs (fetch its docs when unsure of a prop); this one documents how this app
uses them. Match the closest existing screen before inventing structure.
Good references: `components/client/client-form-dialog.tsx` (form dialog),
`components/client/client-workspace.tsx` (cards + metrics),
`app/(user)/clients/[clientId]/page.tsx` (server page),
`components/company-lookup/company-lookup-panel.tsx` (interactive widget).

## Layout of `client/src`

- `app/` — routes. `(user)` = authenticated app, `(auth)` = login/sign-up.
  Quote these paths in zsh: `'client/src/app/(user)/clients/page.tsx'`.
- `components/<domain>/` — feature components; `components/ui/` — shared
  primitives (`EmptyState`, `MetricCard`, `IconContainer`, skeletons).
- `api/` — axios wrappers per domain; `lib/actions/` — `'use server'`
  actions; `lib/constants/pages.ts` — route constants; `lib/utils/` helpers.

## Splitting a feature into files

Don't build a feature as one large component file. Split it along the
existing structure:

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
- Add `'use client'` only to the leaf that needs state, effects, event
  handlers, or browser APIs. Keep data fetching out of client components.
- Server components use `getTranslations('ns')` from `next-intl/server`;
  client components use `useTranslations('ns')`.

## Mutations

Client components call a server action from `lib/actions/<domain>.ts`
(which calls `api/`, maps errors, and `revalidatePath`s) — never `api/`
directly. Actions return `ActionResponseModel`
(`{ ok, message, code?, validationErrors?, data? }`). Handle it the same way
everywhere:

```tsx
const response = await updateThingAction({ userId, thing: data });

toast(response.message || '', { variant: response.ok ? 'success' : 'danger' });

if (!response.ok) {
  Object.entries(response.validationErrors ?? {}).forEach(([key, message]) =>
    setError(key as keyof FormData, { message })
  );
  return;
}
onClose();
```

Server messages are already translated, so show them as-is. Special `code`s
(e.g. `CONFLICT` for duplicate-client confirmation) get their own UI branch.
If the backend endpoint doesn't exist yet, use the **fastify-endpoint** skill.

## Forms (HeroUI v3 + React Hook Form)

- `useForm<FormData>({ defaultValues })`; reset when a dialog opens with new
  data (`useEffect` on `isOpen` → `reset(...)`).
- Wrap every HeroUI field in `Controller`. Validation state and props go on
  the **wrapper** (`TextField isInvalid`, `isDisabled`, `isRequired`), with
  `<Label>`, `<Input>`/`<TextArea>`, and `<FieldError>` inside:

```tsx
<Controller control={control} name="name" render={({ field }) => (
  <TextField variant="secondary" isInvalid={Boolean(errors.name)}>
    <Label>{t('name')}</Label>
    <Input name={field.name} value={field.value ?? ''}
      onChange={field.onChange} onBlur={field.onBlur} />
    {errors.name?.message ? <FieldError>{errors.name.message}</FieldError> : null}
  </TextField>
)} />
```

- `Select` / `ListBox` callbacks give **selected keys**, not DOM events —
  pass the key to `field.onChange`.
- `<form noValidate onSubmit={handleSubmit(onSubmit)}>`; disable submit
  while `isSubmitting` (and usually when `!isDirty` in edit mode).
- Keep client validation light (required/format hints). The server's Zod
  schema is authoritative and its errors map back via `setError`.
- Import only **types** from `@invoicetrackr/types` in client code.

## Dialogs, feedback, states

- Modals use the compound API: `Modal.Backdrop` (owns `isOpen` /
  `onOpenChange`) → `Modal.Container` → `Modal.Dialog` → `Modal.Header` /
  `Modal.Body` / `Modal.Footer`, with `Modal.CloseTrigger`.
- Feedback: `toast(message, { variant })` from `@heroui/react`; inline
  persistent warnings with `Alert`.
- Every data view handles loading (skeleton), empty (`EmptyState` with a
  clear next action), error, disabled, and success. Destructive or
  irreversible actions (issue, void, delete) get a confirmation modal that
  says what can't be undone.

## Styling

- Use HeroUI components, `variant`s, and theme tokens (`text-muted`,
  `text-foreground`, `text-danger`, `text-success`, `bg-default`, `border`) so light/dark
  works automatically. Avoid raw palette colours (`text-gray-500`,
  `bg-blue-600`), custom gradients, or ad-hoc backgrounds.
- Prefer the component's built-in look; add only layout utilities
  (`flex`, `gap-4`, `grid`, responsive breakpoints) via `className`.
- This is a working app, not a marketing site: dense, scannable, clear
  primary action per screen.

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
