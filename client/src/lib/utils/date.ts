// from ISOString to yyyy-MM-dd
export const formatDate = (date: string) => date.split('T')[0];

export const getDateDifferenceInDays = (date1: string, date2: string) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);

  const diffMs = d2.getTime() - d1.getTime();
  return diffMs / (1000 * 60 * 60 * 24);
};
