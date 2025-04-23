'use server';

import { revalidatePath } from 'next/cache';
import { getTranslations } from 'next-intl/server';

import { updateUser } from '@/api';

import { PERSONAL_INFORMATION_PAGE } from '../constants/pages';
import { UserModel } from '../types/models/user';
import { ActionResponseModel } from '../types/response';

export async function updateUserAction({
  user,
  signature
}: {
  user: UserModel;
  signature: string | File | undefined;
}): Promise<ActionResponseModel> {
  if (!user.id) return { ok: false };

  try {
    const response = await updateUser(user.id, {
      ...user,
      signature,
      type: 'sender'
    });

    if ('errors' in response) {
      return {
        ok: false,
        message: response.data.message,
        validationErrors: response.data.errors as Array<{
          key: string;
          value: string;
        }>
      };
    }

    revalidatePath(PERSONAL_INFORMATION_PAGE);
    return { ok: true, message: response.data.message };
  } catch (e) {
    const t = await getTranslations();
    return { ok: false, message: t('general_error') };
  }
}
