'use server';

import { getTranslations } from 'next-intl/server';

export async function getGeneralErrorMessageAction() {
  const t = await getTranslations();

  return t('general_error');
}
