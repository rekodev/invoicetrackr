'use server';
import { AuthError } from 'next-auth';

import { registerUser } from '@/api';

import { signIn, signOut } from '../auth';

export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    await signIn('credentials', formData);
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

export async function logOut() {
  await signOut({ redirect: true, redirectTo: '/' });
}

export async function signUp(
  prevState: { message: string; ok: boolean } | undefined,
  formData: FormData
) {
  const rawFormData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    confirmedPassword: formData.get('confirm-password') as string,
  };

  try {
    const response = await registerUser(rawFormData);

    return {
      message: response.data.message,
      ok: 'errors' in response.data ? false : true,
    };
  } catch (error) {
    throw error;
  }
}
