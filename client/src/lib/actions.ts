'use server';

import { HttpStatusCode } from 'axios';
import { redirect } from 'next/navigation';
import { AuthError } from 'next-auth';
import { getTranslations } from 'next-intl/server';

import { createNewUserPassword, registerUser, resetUserPassword } from '@/api';

import { signIn, signOut, unstable_update } from '../auth';
import { DASHBOARD_PAGE, ONBOARDING_PAGE } from './constants/pages';
import { UserModel } from './types/models/user';

export type ActionReturnType = {
  ok: boolean;
  message?: string;
};

export async function resetPasswordAction(
  _prevState: ActionReturnType | undefined,
  email: string
): Promise<ActionReturnType> {
  try {
    const response = await resetUserPassword({ email });

    if (response.status !== HttpStatusCode.Ok) {
      return { ok: false, message: response.data.message };
    }

    return { ok: true, message: response.data.message };
  } catch (error) {
    const t = await getTranslations();
    return { ok: false, message: t('general_error') };
  }
}

export async function createNewPasswordAction(
  _prevState: ActionReturnType | undefined,
  formData: FormData
): Promise<ActionReturnType> {
  const rawFormData = {
    userId: formData.get('userId'),
    newPassword: formData.get('newPassword') as string,
    confirmedNewPassword: formData.get('confirmedNewPassword') as string,
    token: formData.get('token') as string
  };

  const { userId, newPassword, confirmedNewPassword, token } = rawFormData;

  try {
    const response = await createNewUserPassword({
      userId: Number(userId),
      newPassword,
      confirmedNewPassword,
      token
    });

    if (response.status !== HttpStatusCode.Ok) {
      return { ok: false, message: response.data.message };
    }

    return { ok: true, message: response.data.message };
  } catch {
    const t = await getTranslations();
    return { ok: false, message: t('general_error') };
  }
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
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}

export async function logOutAction() {
  await signOut({ redirect: true, redirectTo: '/' });
}

export async function signUp(
  _prevState: { message: string; ok: boolean } | undefined,
  formData: FormData
) {
  const rawFormData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    confirmedPassword: formData.get('confirm-password') as string
  };

  try {
    const response = await registerUser(rawFormData);

    if ('errors' in response.data) {
      return { ok: false, message: response.data.message };
    }

    return signIn('credentials', {
      ...rawFormData,
      redirectTo: ONBOARDING_PAGE
    });
  } catch (error) {
    throw error;
  }
}

export const updateSession = async ({
  newSession,
  redirectPath
}: {
  newSession: UserModel & {
    isOnboarded?: boolean;
    isSubscriptionActive?: boolean;
  };
  redirectPath?: string;
}) => {
  await unstable_update({
    user: {
      ...newSession,
      isOnboarded: true,
      id: String(newSession.id)
    }
  });

  if (redirectPath) {
    redirect(redirectPath);
  }
};
