"use client";

import { ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/20/solid";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  cn,
  Input,
  Link,
} from "@heroui/react";
import { useTranslations } from "next-intl";
import { useActionState } from "react";

import { resetPasswordAction, ActionReturnType } from "@/lib/actions";
import { FORGOT_PASSWORD_PAGE, SIGN_UP_PAGE } from "@/lib/constants/pages";

export default function ForgotPasswordForm() {
  const t = useTranslations("forgot_password");
  const [response, formAction, isPending] = useActionState(
    (prevState: ActionReturnType | undefined, formData: FormData) =>
      resetPasswordAction(prevState, formData.get("email") as string),
    undefined,
  );

  return (
    <Card
      className="mx-auto w-full max-w-lg border border-neutral-800"
      isBlurred
    >
      <CardHeader className="p-8 pb-0">
        <h1 className="text-3xl font-medium">{t("card_header")}</h1>
      </CardHeader>
      <CardBody className="p-8 pb-0">
        <form action={formAction} className="flex flex-col gap-4">
          <Input
            labelPlacement="outside"
            variant="faded"
            id="email"
            type="email"
            name="email"
            label={t("email")}
            placeholder={t("email_placeholder")}
            required
          />
          <Button
            className="w-full justify-between"
            aria-disabled={isPending}
            isLoading={isPending}
            type="submit"
            endContent={<ArrowRightIcon className="h-5 w-5" />}
            color="secondary"
          >
            {t("reset_link")}
          </Button>
          <div aria-live="polite" aria-atomic="true">
            {response?.message && (
              <div className="flex items-center gap-1 mb-6">
                {response.ok ? (
                  <CheckCircleIcon className="h-5 w-5 text-success-500" />
                ) : (
                  <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                )}
                <p
                  className={cn("text-sm", {
                    "text-success-500": response.ok,
                    "text-red-500": !response.ok,
                  })}
                >
                  {response.message}
                </p>
              </div>
            )}
          </div>
        </form>
      </CardBody>
      <CardFooter className="flex flex-col items-center justify-center pt-0 pb-8 gap-1">
        <Link color="secondary" href={FORGOT_PASSWORD_PAGE}>
          <ArrowLeftIcon className="w-4 h-4 mr-1" /> {t("login")}
        </Link>
        <div className="flex gap-1">
          <p className="text-md">{t("create_account")}</p>
          <Link color="secondary" href={SIGN_UP_PAGE}>
            {t("sign_up")}
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
