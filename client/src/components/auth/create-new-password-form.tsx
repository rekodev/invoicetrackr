"use client";

import { ArrowRightIcon } from "@heroicons/react/20/solid";
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

import { ActionReturnType, createNewPasswordAction } from "@/lib/actions";
import { LOGIN_PAGE } from "@/lib/constants/pages";

type Props = {
  userId: number;
  token: string;
};

export default function CreateNewPasswordForm({ userId, token }: Props) {
  const t = useTranslations("create_new_password.form");
  const [response, formAction, isPending] = useActionState(
    (prevState: ActionReturnType | undefined, formData: FormData) => {
      const newFormData = new FormData();
      formData.forEach((value, key) => newFormData.append(key, value));
      newFormData.append("userId", String(userId));
      newFormData.append("token", token);

      return createNewPasswordAction(prevState, newFormData);
    },
    undefined,
  );

  return (
    <Card
      className="mx-auto w-full max-w-lg border border-neutral-800"
      isBlurred
    >
      <CardHeader className="p-8 pb-0">
        <h1 className="text-3xl font-medium">{t("title")}</h1>
      </CardHeader>
      <CardBody className="p-8 pb-0">
        <form action={formAction} className="flex flex-col gap-4">
          <Input
            labelPlacement="outside"
            variant="faded"
            id="newPassword"
            type="password"
            name="newPassword"
            label={t("new_password")}
            placeholder={t("new_password_placeholder")}
            required
            minLength={6}
          />
          <Input
            labelPlacement="outside"
            variant="faded"
            id="confirmedNewPassword"
            type="password"
            name="confirmedNewPassword"
            label={t("confirmed_new_password")}
            placeholder={t("confirmed_new_password_placeholder")}
            required
            minLength={6}
          />
          <Button
            className="w-full justify-between"
            aria-disabled={isPending}
            isLoading={isPending}
            type="submit"
            endContent={<ArrowRightIcon className="h-5 w-5" />}
            color="secondary"
          >
            {t("submit")}
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
                    "text-red-500": !response.ok,
                    "text-success-500": response.ok,
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
        <div className="flex gap-1">
          <p className="text-md">{t("remember_your_password")}</p>{" "}
          <Link color="secondary" href={LOGIN_PAGE}>
            {t("sign_in")}
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
