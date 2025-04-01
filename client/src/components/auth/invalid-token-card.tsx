"use client";

import { ArrowRightIcon } from "@heroicons/react/20/solid";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Link,
} from "@heroui/react";
import { useTranslations } from "next-intl";

import { FORGOT_PASSWORD_PAGE, LOGIN_PAGE } from "@/lib/constants/pages";

export default function InvalidTokenCard() {
  const t = useTranslations("create_new_password.invalid_token");

  return (
    <Card
      className="mx-auto w-full max-w-lg border border-neutral-800"
      isBlurred
    >
      <CardHeader className="flex flex-col gap-2 p-8 pb-0">
        <h1 className="text-3xl font-medium">{t("title")}</h1>
        <p className="text-center text-default-500">{t("description")}</p>
      </CardHeader>
      <CardBody className="p-8 pb-4">
        <Button
          as={Link}
          href={FORGOT_PASSWORD_PAGE}
          className="w-full justify-between"
          endContent={<ArrowRightIcon className="h-5 w-5" />}
          color="secondary"
        >
          {t("request_new")}
        </Button>
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
