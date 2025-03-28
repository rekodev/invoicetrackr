import { useTranslations } from "next-intl";

import ForgotPasswordForm from "@/components/auth/forgot-password-form";
import AppLogo from "@/components/icons/AppLogo";

const ForgotPasswordPage = () => {
  const t = useTranslations("forgot_password");

  return (
    <section className="py-8 flex flex-col justify-center items-center gap-4">
      <AppLogo />
      <div className="flex flex-col justify-center items-center gap-1 mb-6">
        <h2 className="text-2xl font-medium">{t("title")}</h2>
        <p className="text-default-500">{t("description")}</p>
      </div>
      <ForgotPasswordForm />
    </section>
  );
};

export default ForgotPasswordPage;
