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
