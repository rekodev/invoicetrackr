import en from './messages-en.json';
import lt from './messages-lt.json';

export const createPdfTranslator = (language: string) =>
  (key: string, values: Record<string, string | number> = {}) => {
    const messages = language === 'lt' ? lt : en;
    const text = key.split('.').reduce<unknown>((value, segment) =>
      value && typeof value === 'object' ? (value as Record<string, unknown>)[segment] : undefined,
      messages);
    if (typeof text !== 'string') throw new Error(`Missing PDF translation: ${key}`);
    return text.replace(/\{(\w+)\}/g, (_, name: string) => String(values[name] ?? `{${name}}`));
  };
