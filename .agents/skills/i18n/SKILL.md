---
name: i18n
description: "Add or change user-facing copy in Lithuanian and English (client messages, server locales, validation keys, PDF text) and locale behaviour. Use whenever a change touches any text users see."
---

# i18n Strings (InvoiceTrackr)

Lithuanian is the primary language — the product is for Lithuanian
freelancers — and English is a polished secondary. Every user-facing string
must exist in **both** languages in the same change. Missing keys show raw
key paths to users, and English-only copy breaks the Lithuania-first promise.

## How the locale is chosen

- Client: `client/src/i18n/request.ts` → `resolveLocale(cookie, accept-language)`.
  An explicit `locale` cookie (set by the language switcher or from the
  logged-in user's language setting) wins; otherwise the highest-quality
  `lt`/`en` match in `Accept-Language`, falling back to English. Intended
  product behaviour: Lithuanian for Lithuanian visitors, English otherwise.
- Server: `i18n.t` follows the request's `Accept-Language`, which the
  client sets in `getRequestHeadersAction` (`client/src/lib/actions.ts`) from
  next-intl's resolved locale, so API messages match the UI language.
- Issued invoice PDFs use the invoice's frozen `documentLanguage`, not the
  viewer's locale.

Keep this behaviour when touching locale code; tests live in
`client/src/i18n/__tests__/resolve-locale.test.ts`.

## Where copy lives

| Surface | Files | Interpolation |
| --- | --- | --- |
| Client UI (next-intl) | `client/messages/en.json`, `client/messages/lt.json` | ICU: `{name}`, `{count, plural, …}` |
| Server responses, toasts, errors, emails | `server/src/locales/en.ts`, `lt.ts` | `%{name}` |
| Zod validation messages | key strings in `shared/types/src/*.ts` → `validation.*` in server locales | — |
| Invoice PDF | `shared/pdf/src/messages-en.json`, `messages-lt.json` | ICU |

Pick by where the text renders: if the server sends it (`message` in an API
response, a validation error, an email), it's a server locale key and the
client just displays it. If a component renders it, it's a client message.

## Client messages

- Nested objects keyed by feature namespace (`clients`, `invoices`,
  `company_lookup`, …), **snake_case** keys, 4-space JSON indentation.
  `en.json` and `lt.json` keep identical keys in the same order.
- Group under the component's namespace so it can call
  `useTranslations('clients.form_dialog')` / `getTranslations(...)`.
  Accessibility strings go under an `a11y` sub-object.
- Plurals use ICU. Lithuanian needs `one`, `few`, and `other`
  (1 / 2–9 / 0, 10–20):
  `"{count, plural, one {# mokėjimas} few {# mokėjimai} other {# mokėjimų}}"`.
  English needs `one` and `other`.
- Don't concatenate translated fragments in code; Lithuanian word order and
  cases differ. Use one message with placeholders.
- Component tests render with `withIntl`, which loads `en.json`, so tests
  assert English text.

## Server messages

- `server/src/locales/{en,lt}.ts` export a nested object: `emails`,
  `validation`, `success`, `error`, …, camelCase keys
  (`error.companyLookup.unavailable`, `success.client.created`).
- Controllers use `i18n.t('success.thing.created')`; errors throw
  `new BadRequestError(i18n.t('error.thing.unableToX'))`.
- Zod schemas in `shared/types` pass **keys** as messages
  (`.min(1, 'validation.client.name')`); the server error handler translates
  them. Every key used in a schema must exist under `validation` in both
  locale files.

## Writing good Lithuanian

- Natural business Lithuanian, not word-for-word translation. Address the
  user politely with the plural imperative for actions ("Įveskite",
  "Bandykite dar kartą", "Išsaugokite").
- Always use correct diacritics (ą č ę ė į š ų ū ž). "Saskaita" for
  "Sąskaita" is a bug.
- Use the accepted domain terms: sąskaita faktūra, PVM sąskaita faktūra,
  PVM (not VAT), PVM mokėtojo kodas, įmonės kodas, individuali veikla,
  pajamų žurnalas, apmokėjimo terminas, mokėjimas, išlaidos, klientas,
  serija, numeris. Status labels already in use: Juodraštis (draft),
  Išrašyta (issued), Anuliuota (voided), Laukiama (pending), Sumokėta
  (paid), Pradelsta (overdue), Atšaukta (canceled). Reuse the term
  `lt.json` already uses for a concept rather than introducing a synonym.
- Keep the button/heading capitalization style of neighbouring strings
  (sentence case is the norm in Lithuanian UI).
- Dates and money are formatted in code with the locale, not written into
  strings.

## English

Clear, concise product English. Lithuanian-specific terms may keep the
Lithuanian name with a gloss where users expect it (e.g. "Income journal
(pajamų žurnalas)").

## Checklist

- [ ] Key added to both `en` and `lt` files for each surface touched
- [ ] Placeholders identical in both languages
- [ ] Lithuanian plurals include `few`
- [ ] Validation keys used in shared schemas exist in both server locales
- [ ] No hard-coded user-facing strings left in components or controllers
