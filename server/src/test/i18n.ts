import en from '../locales/en';
import lt from '../locales/lt';
import { mockUseI18n } from './setup';

export const translate = (
  locale: typeof en | typeof lt,
  key: string,
  options?: Record<string, string>
) => {
  const value = key
    .split('.')
    .reduce<unknown>(
      (result, segment) =>
        typeof result === 'object' && result !== null
          ? (result as Record<string, unknown>)[segment]
          : undefined,
      locale
    );

  if (typeof value !== 'string') return key;

  return Object.entries(options || {}).reduce(
    (translation, [name, replacement]) =>
      translation.replace(`%{${name}}`, replacement),
    value
  );
};

export const mockLocalizedI18n = () =>
  mockUseI18n.mockImplementation(async (request) => {
    const locale = request?.headers['accept-language'] === 'lt' ? lt : en;

    return {
      t: (key: string, options?: Record<string, string>) =>
        translate(locale, key, options)
    } as never;
  });
