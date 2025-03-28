"use client";

import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Chip,
  Divider,
  Input,
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

import { addBankingInformation } from "@/api";
import { BANKING_INFORMATION_PAGE } from "@/lib/constants/pages";
import useGetUser from "@/lib/hooks/user/useGetUser";
import {
  BankingInformationFormModel,
  bankingInformationSchema,
} from "@/lib/types/models/user";

type Props = {
  userId: number;
};

const AddNewBankAccountForm = ({ userId }: Props) => {
  const router = useRouter();
  const { user, mutateUser } = useGetUser({ userId });
  const {
    register,
    handleSubmit,
    setError,
    formState: { isSubmitSuccessful, isSubmitting },
  } = useForm<BankingInformationFormModel>({
    defaultValues: {},
    resolver: zodResolver(bankingInformationSchema),
  });

  const [submissionMessage, setSubmissionMessage] = useState("");

  const onSubmit: SubmitHandler<BankingInformationFormModel> = async (data) => {
    if (!user?.id) return;

    const response = await addBankingInformation(
      user.id,
      data,
      !!user.selectedBankAccountId,
    );
    setSubmissionMessage(response.data.message);

    if ("errors" in response.data) {
      response.data.errors.forEach((error) => {
        setError(error.key, { message: error.value });
      });

      return;
    }

    mutateUser();
    router.push(BANKING_INFORMATION_PAGE);
  };

  return (
    <Card className="w-full border border-neutral-800 bg-transparent">
      <form
        aria-label="Banking Information Form"
        onSubmit={handleSubmit(onSubmit)}
      >
        <CardHeader className="p-4 px-6">Banking Information</CardHeader>
        <Divider />
        <CardBody className="p-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            {...register("name")}
            label="Bank Name"
            variant="faded"
            labelPlacement="outside"
            placeholder="e.g., Swedbank"
          />
          <Input
            {...register("code")}
            label="Bank Code"
            variant="faded"
            labelPlacement="outside"
            placeholder="e.g., HABALT22"
          />
          <Input
            {...register("accountNumber")}
            label="Bank Account Number"
            variant="faded"
            labelPlacement="outside"
            placeholder="e.g., LT12 1000 0111 0100 1000"
          />
        </CardBody>
        <CardFooter className="justify-end p-6 gap-2">
          {submissionMessage && (
            <Chip color={isSubmitSuccessful ? "success" : "danger"}>
              {submissionMessage}
            </Chip>
          )}
          <div className="flex gap-2">
            <Button
              color="danger"
              variant="light"
              onPress={() => router.push(BANKING_INFORMATION_PAGE)}
            >
              Cancel
            </Button>
            <Button type="submit" color="secondary" isLoading={isSubmitting}>
              Save
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};

export default AddNewBankAccountForm;
