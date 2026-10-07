---
name: forms
description: "InvoiceTrackr form conventions: every form uses React Hook Form with HeroUI v3 fields, server-action submission, and server validation errors mapped onto fields. Use whenever building or changing a form, form dialog, or input-driven flow in client/, or testing one."
---

# Forms (InvoiceTrackr)

Every form in `client/` uses **React Hook Form** (`useForm` + `Controller`)
with HeroUI v3 fields. This keeps field state, dirty tracking, and error
display identical across the app. Don't hand-roll `useState` per field or
use `<form action={serverAction}>` for data entry. The only exceptions are
single-button `<form action>` wrappers with no fields, such as Google
sign-in and log-out.

**Reference implementation:** `client/src/components/client/client-form-dialog.tsx`
and its test `client/src/components/client/__tests__/client-form-dialog.test.tsx`.
Copy their structure before inventing anything. Other good examples:
`invoice/invoice-payment-dialog.tsx` (client-side `rules`) and
`profile/personal-information-form.tsx` (page form).

For HeroUI component APIs (`TextField`, `Select`, `Modal`, …) use the
**heroui-react** skill and fetch the component's `.mdx` docs when unsure of a
prop.

## Shape of a form component

```tsx
'use client';

type ThingFormData = Omit<ThingBody, 'archivedAt'>;

const getInitialThingData = (thing?: ThingBody): ThingFormData => ({
  id: thing?.id,
  name: thing?.name || '',
  email: thing?.email || ''
});

const ThingFormDialog = ({ userId, isOpen, onClose, thing }: Props) => {
  const t = useTranslations('things.form_dialog');
  const {
    control,
    handleSubmit,
    formState: { isDirty, isSubmitting, errors },
    setError,
    reset
  } = useForm<ThingFormData>({ defaultValues: getInitialThingData(thing) });

  useEffect(() => {
    if (isOpen) reset(getInitialThingData(thing));
  }, [isOpen, thing, reset]);

  const onSubmit: SubmitHandler<ThingFormData> = async (data) => {
    const response = await saveThingAction({ userId, thing: data });

    toast(response.message || '', { variant: response.ok ? 'success' : 'danger' });

    if (!response.ok) {
      Object.entries(response.validationErrors ?? {}).forEach(([key, message]) =>
        setError(key as keyof ThingFormData, { message })
      );
      return;
    }
    onClose();
  };

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)}>
      …fields…
      <Button type="submit" isDisabled={isSubmitting || !isDirty}>{t('save')}</Button>
    </form>
  );
};
```

Rules behind the shape:

- **Types.** The form type is the shared API type from `@invoicetrackr/types`
  (types only, never the Zod schema), narrowed with `Omit`/`Pick` when the
  form edits a subset.
- **Defaults** come from a pure `getInitial<Thing>Data(entity?)` function.
  Put it in `lib/utils/<domain>.ts` once it is reused or grows past a few
  lines. Use `''` rather than `undefined` for text fields so inputs stay
  controlled.
- **Dialogs reset on open.** Run `useEffect` on `isOpen` and call
  `reset(getInitial…(entity))`, so reopening never shows stale values or
  errors.
- **Submit button.** Disable it with `isSubmitting`. In edit mode also
  disable it while `!isDirty`.
- **`<form noValidate>`.** Validation messages come from us, not the
  browser.

## Fields

Wrap every HeroUI field in `Controller`. Validation state and props go on the
**wrapper** (`TextField isInvalid`, `isDisabled`, `isRequired`), with
`<Label>`, `<Input>`/`<TextArea>`, and `<FieldError>` inside:

```tsx
<Controller control={control} name="name" render={({ field }) => (
  <TextField variant="secondary" isInvalid={Boolean(errors.name)}>
    <Label>{t('fields.name')}</Label>
    <Input name={field.name} value={field.value ?? ''}
      onChange={field.onChange} onBlur={field.onBlur} />
    {errors.name?.message ? <FieldError>{errors.name.message}</FieldError> : null}
  </TextField>
)} />
```

- **`Select` and `ListBox`.** Their callbacks give **selected keys**, not
  DOM events. Pass the key to `field.onChange`, and put `isInvalid` plus
  `<FieldError>` on the `Select`.
- **Repeated text fields** go through a small local
  `renderTextField({ name, label, type })` helper, as in
  `client-form-dialog.tsx`, instead of copy-pasted `Controller` blocks.
- **Programmatic fills** (lookups, presets) use
  `setValue(name, value, { shouldDirty: true })` followed by
  `clearErrors([...])` for the filled fields.
- **Watching a value for conditional fields:** use `watch('field')`.
- **Labels.** Every field has a visible `<Label>`. Icon-only buttons inside
  a form get an `aria-label`.

## Validation and errors

- **Authoritative validation lives on the server** in the shared Zod schemas
  (`shared/types`). Their messages are i18n keys under `validation.*` in
  `server/src/locales/{en,lt}.ts` (see **i18n** and **fastify-endpoint**).
- **Client-side checks are light:** `Controller` `rules` (`required`,
  `validate`) with translated messages, only where they save a round trip.
  See `invoice-payment-dialog.tsx`. Don't duplicate the Zod schema on the
  client, and don't import schemas into client code.
- **Server errors reach fields through one pipeline.** The Fastify error
  handler returns `{ errors: [{ key, value }] }`. The server action maps it
  with `mapValidationErrors` (`lib/utils/validation.ts`) into
  `ActionResponseModel.validationErrors`, and the form applies it with
  `setError(key, { message })`. Keys are dotted field paths
  (`receiver.email`, `services.0.amount`), which RHF accepts directly.
- **Messages from the server are already translated.** Show them as-is in
  the toast or `FieldError`.
- **Special `code`s** (for example `CONFLICT` for the duplicate-client
  confirmation) get their own UI branch, usually an `Alert` in the footer,
  before the generic toast and error handling.

## Submission

- **Submit through a server action** in `lib/actions/<domain>.ts`, never an
  `api/` call from the component. The action returns `ActionResponseModel`
  (`{ ok, message, code?, validationErrors?, data? }`) and
  `revalidatePath`s affected pages. If the endpoint doesn't exist yet, use
  **fastify-endpoint**.
- **Feedback:** `toast(message, { variant })` on both outcomes. Close the
  dialog or navigate only when `ok`. On failure keep the form open with
  field errors set.
- **Destructive or irreversible submits** (issue, void, delete) get a
  confirmation modal that says what can't be undone.

## Layout

- Dialog forms use the compound `Modal` API: `Modal.Backdrop` (owns
  `isOpen` / `onOpenChange`) → `Modal.Container` → `Modal.Dialog` →
  `<form>` wrapping `Modal.Header` / `Modal.Body` / `Modal.Footer`, plus
  `Modal.CloseTrigger`.
- Footer buttons: a cancel `ghost` button and the primary submit, stacked on
  mobile (`flex-col-reverse … sm:flex-row`).
- All copy goes in `client/messages/{en,lt}.json` under the component's
  namespace (`things.form_dialog.fields.*`).

## Testing forms

Extend the form's existing test (**testing** and **test-design** skills).
The pattern from `client-form-dialog.test.tsx`:

- Mock the action module with `vi.hoisted` + `vi.mock('@/lib/actions/<domain>', …)`,
  and stub heavy child widgets (lookup panels) with a minimal fake.
- Render with `withIntl`, fill fields by label with `userEvent`, and submit
  by role and name.
- One journey per outcome:
  - Success asserts the action arguments, the toast, and that the dialog
    closes.
  - Failure resolves `{ ok: false, validationErrors: { field: 'msg' } }` and
    asserts the message under the field and that the dialog stays open.
