import { getTranslations } from "next-intl/server";

import CreateNewPasswordForm from "@/components/auth/create-new-password-form";
import AppLogo from "@/components/icons/AppLogo";

type Props = {
  params: Promise<{ token: string }>;
};

export default async function CreateNewPasswordPage({ params }: Props) {
  const t = await getTranslations("create_new_password");
  // TODO: Use token to find user and pass user id to form
  // So that it knows which user to update the password for
  const { token } = await params;

  return (
    <section className="py-8 flex flex-col justify-center items-center gap-4">
      <AppLogo />
      <div className="flex flex-col justify-center items-center gap-1 mb-6">
        <h2 className="text-2xl font-medium">{t("title")}</h2>
        <p className="text-default-500">{t("description")}</p>
      </div>
      <CreateNewPasswordForm />
    </section>
  );
}
