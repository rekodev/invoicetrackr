'use server';

import { AuthError, User } from 'next-auth';
import { cookies } from 'next/headers';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';

import {
  createNewUserPassword,
  registerUser,
  resetUserPassword
} from '@/api/user';
import { auth } from '@/auth';

import { DASHBOARD_PAGE, ONBOARDING_PAGE } from './constants/pages';
import { signIn, signOut, unstable_update } from '../auth';
import { ActionResponseModel } from './types/action';
import { isResponseError } from './utils/error';
import { mapValidationErrors } from './utils/validation';

export async function resetPasswordAction(
  _prevState: ActionResponseModel | undefined,
  email: string
): Promise<ActionResponseModel> {
  const response = await resetUserPassword({ email });

  if (isResponseError(response)) {
    return { ok: false, message: response.data.message };
  }

  return { ok: true, message: response.data.message };
}

export async function createNewPasswordAction(
  _prevState: ActionResponseModel | undefined,
  formData: FormData
): Promise<ActionResponseModel> {
  const rawFormData = {
    userId: formData.get('userId'),
    newPassword: formData.get('newPassword') as string,
    confirmedNewPassword: formData.get('confirmedNewPassword') as string,
    token: formData.get('token') as string
  };

  const { userId, newPassword, confirmedNewPassword, token } = rawFormData;

  const response = await createNewUserPassword({
    userId: Number(userId),
    newPassword,
    confirmedNewPassword,
    token
  });

  if (isResponseError(response)) {
    return { ok: false, message: response.data.message };
  }

  return { ok: true, message: response.data.message };
}

export async function authenticateAction(
  _prevState: string | undefined,
  formData: FormData
) {
  try {
    await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirectTo: DASHBOARD_PAGE
    });
  } catch (error) {
    const t = await getTranslations('login.error');

    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return t('invalid_credentials');
        default:
          return t('general');
      }
    }
    throw error;
  }
}

export async function logOutAction() {
  await signOut({ redirect: true, redirectTo: '/' });
}

export async function signUpAction(
  _prevState: { message: string; ok: boolean } | undefined,
  formData: FormData
) {
  const rawFormData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    confirmedPassword: formData.get('confirm-password') as string
  };

  const response = await registerUser(rawFormData);

  if (isResponseError(response)) {
    return {
      ok: false,
      errors: mapValidationErrors(response.data.errors),
      message: response.data.message
    };
  }

  return signIn('credentials', {
    ...rawFormData,
    redirectTo: ONBOARDING_PAGE
  });
}

export const updateSessionAction = async ({
  newSession,
  redirectPath
}: {
  newSession: Partial<User>;
  redirectPath?: string;
}) => {
  const session = await auth();

  await unstable_update({
    user: {
      ...session?.user,
      ...newSession
    }
  });

  if (redirectPath) {
    redirect(redirectPath);
  }
};

export const getRequestHeadersAction = async () => {
  const cookieStore = await cookies();

  const authToken =
    cookieStore.get('__Secure-authjs.session-token')?.value ||
    cookieStore.get('authjs.session-token')?.value;

  const isCookieSecure = !!cookieStore.get('__Secure-authjs.session-token')
    ?.value;

  const headers: Record<string, string> = {};

  if (authToken) {
    headers['Cookie'] =
      `${isCookieSecure ? '__Secure-' : ''}authjs.session-token=${authToken}`;
  }

  headers['Accept-Language'] = cookieStore.get('locale')?.value || 'en';

  return headers;
};

export async function setLocaleCookieAction(locale: string) {
  const cookieStore = await cookies();

  cookieStore.set('locale', locale || 'en');
}

export async function getLocaleCookieAction() {
  const cookieStore = await cookies();

  return cookieStore.get('locale')?.value || 'en';
}
