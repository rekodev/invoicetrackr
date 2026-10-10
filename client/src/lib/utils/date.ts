// from ISOString to yyyy-MM-dd
export const formatDate = (date: string) => date.split('T')[0];

export const formatLocalizedDate = (
  date: string | null | undefined,
  locale: string
) => {
  if (!date) return undefined;

  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date(date));
};

const firstOfMonth = (year: number, month: number) =>
  new Date(Date.UTC(year, month - 1, 1));

export const formatMonthName = (year: number, month: number, locale: string) =>
  new Intl.DateTimeFormat(locale, { month: 'long', timeZone: 'UTC' }).format(
    firstOfMonth(year, month)
  );

export const formatMonthYear = (year: number, month: number, locale: string) =>
  new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(firstOfMonth(year, month));

export const getDateDifferenceInDays = (date1: string, date2: string) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);

  const diffMs = d2.getTime() - d1.getTime();
  return diffMs / (1000 * 60 * 60 * 24);
};

export const addDaysToDate = (date: string, days: number) => {
  const [year, month, day] = date.split('-').map(Number);
  const nextDate = new Date(Date.UTC(year, month - 1, day));
  nextDate.setUTCDate(nextDate.getUTCDate() + days);

  return formatDate(nextDate.toISOString());
};

export const todayInLithuania = (now = new Date()) => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Vilnius', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(now);
  const get = (type: string) => parts.find((part) => part.type === type)?.value;
  return `${get('year')}-${get('month')}-${get('day')}`;
};
