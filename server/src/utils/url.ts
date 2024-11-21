export const getTranslationKeyPrefix = (url: string) => {
  const urlParts = url.split('/');

  if (urlParts.includes('invoices')) {
    return 'invoice';
  } else if (urlParts.includes('clients')) {
    return 'client';
  } else if (urlParts.includes('users')) {
    return 'user';
  } else if (urlParts.includes('banking-information')) {
    return 'bankingInformation';
  }
};
