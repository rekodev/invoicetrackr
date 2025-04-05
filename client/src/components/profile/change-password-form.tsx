"use client";

import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
} from "@heroui/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

import { changeUserPassword } from "@/api";
import { UiState } from "@/lib/constants/uiState";
import useGetUser from "@/lib/hooks/user/useGetUser";
import { ChangePasswordFormModel } from "@/lib/types/models/user";

import PasswordInput from "../password-input";
import ErrorAlert from "../ui/error-alert";
import GeneralFormError from "../ui/general-form-error";
import Loader from "../ui/loader";

type Props = {
  userId: number;
  language: string;
};

export default function ChangePasswordForm({ userId, language }: Props) {
  const { mutateUser, user, isUserLoading, userError } = useGetUser({ userId });
  const t = useTranslations("profile.change_password");
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setError,
    reset,
  } = useForm<ChangePasswordFormModel>({
    defaultValues: { password: "", newPassword: "", confirmedNewPassword: "" },
  });
  const [submissionMessage, setSubmissionMessage] = useState("");
  const [uiState, setUiState] = useState(UiState.Idle);

  const onSubmit: SubmitHandler<ChangePasswordFormModel> = async (data) => {
    if (!user?.id) return;

    setSubmissionMessage("");
    setUiState(UiState.Pending);

    const response = await changeUserPassword({
      userId: user.id,
      language,
      password: data.password,
      newPassword: data.newPassword,
      confirmedNewPassword: data.confirmedNewPassword,
    });
    setSubmissionMessage(response.data.message);

    if ("errors" in response.data) {
      setUiState(UiState.Failure);

      response.data.errors.forEach((error) => {
        setError(error.key, { message: error.value });
      });

      return;
    }

    setUiState(UiState.Success);
    mutateUser();
    reset();
  };

  const renderCardBodyAndFooter = () => {
    if (isUserLoading)
      return (
        <div className="h-full pb-8">
          <Loader fullHeight />
        </div>
      );

    const registeredPassword = { ...register("password") };
    const registeredNewPassword = { ...register("newPassword") };
    const registeredConfirmedNewPassword = {
      ...register("confirmedNewPassword"),
    };

    return (
      <>
        <CardBody className="p-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <PasswordInput
            placeholder={t("current_password_placeholder")}
            registeredPassword={registeredPassword}
            label={t("current_password")}
            isInvalid={!!errors.password}
            errorMessage={errors.password?.message}
          />
          <PasswordInput
            placeholder={t("new_password_placeholder")}
            registeredPassword={registeredNewPassword}
            label={t("new_password")}
            isInvalid={!!errors.newPassword}
            errorMessage={errors.newPassword?.message}
          />
          <small className="mt-[-8] text-default-500 col-span-2">
            {t("password_requirements")}
          </small>
          <PasswordInput
            placeholder={t("confirm_new_password_placeholder")}
            registeredPassword={registeredConfirmedNewPassword}
            label={t("confirm_new_password")}
            isInvalid={!!errors.confirmedNewPassword}
            errorMessage={errors.confirmedNewPassword?.message}
          />
        </CardBody>
        <CardFooter className="relative justify-between p-6 w-full">
          <GeneralFormError
            submissionMessage={submissionMessage}
            uiState={uiState}
          />
          <hr />
          <div className="flex gap-2 self-end">
            <Button
              isDisabled={!isDirty}
              type="submit"
              isLoading={uiState === UiState.Pending}
              color="secondary"
              className="self-end"
            >
              {t("save_changes")}
            </Button>
          </div>
        </CardFooter>
      </>
    );
  };

  if (userError) return <ErrorAlert />;

  return (
    <Card
      as="form"
      aria-label={t("aria_label")}
      onSubmit={handleSubmit(onSubmit)}
      className="w-full bg-transparent dark:border dark:border-default-100"
    >
      <CardHeader className="p-4 px-6">{t("title")}</CardHeader>
      <Divider />
      {renderCardBodyAndFooter()}
    </Card>
  );
}
