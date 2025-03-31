"use client";

import { ArrowRightIcon } from "@heroicons/react/20/solid";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Input,
  Link,
} from "@heroui/react";
import { useTranslations } from "next-intl";
import { useActionState } from "react";

import { createNewPasswordAction } from "@/lib/actions";
import { LOGIN_PAGE } from "@/lib/constants/pages";

export default function CreateNewPasswordForm() {
  const t = useTranslations("create_new_password.form");
  const [response, formAction, isPending] = useActionState(
    createNewPasswordAction,
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
            placeholder="Enter new password"
            required
            minLength={6}
          />
          <Input
            labelPlacement="outside"
            variant="faded"
            id="confirmNewPassword"
            type="password"
            name="confirmNewPassword"
            label={t("confirm_new_password")}
            placeholder="Confirm new password"
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
                <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                <p className="text-sm text-red-500">{response.message}</p>
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
