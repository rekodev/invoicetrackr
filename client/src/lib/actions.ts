"use server";

import { AuthError } from "next-auth";

import { registerUser } from "@/api";

import { signIn, signOut, unstable_update } from "../auth";
import { UserModel } from "./types/models/user";

type ResetPasswordActionReturnType = {
  ok: boolean;
  message?: string;
};

// TODO: Finish implementing
export async function resetPasswordAction(
  _prevState: ResetPasswordActionReturnType | undefined,
): Promise<ResetPasswordActionReturnType> {
  try {
    // const response = await resetPassword()
    // if (response.status)
    if (true) {
      return { ok: true, message: "success" };
    }
    return { ok: false, message: "error.email" };
  } catch (error) {
    return { ok: false, message: "error.general" };
  }
}

export async function authenticate(
  _prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid credentials.";
        default:
          return "Something went wrong.";
      }
    }
    throw error;
  }
}

export async function logOut() {
  await signOut({ redirect: true, redirectTo: "/" });
}

export async function signUp(
  prevState: { message: string; ok: boolean } | undefined,
  formData: FormData,
) {
  const rawFormData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmedPassword: formData.get("confirm-password") as string,
  };

  try {
    const response = await registerUser(rawFormData);

    return {
      message: response.data.message,
      ok: "errors" in response.data ? false : true,
    };
  } catch (error) {
    throw error;
  }
}

export const updateSession = async (user: UserModel) => {
  await unstable_update({
    user: {
      email: user.email,
      currency: user.currency,
      language: user.language,
      id: String(user.id),
      name: user.name,
    },
  });
};
