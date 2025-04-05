"use client";

import {
  UserGroupIcon,
  BuildingLibraryIcon,
} from "@heroicons/react/24/outline";
import { Button, Card, Chip, Input, Select, SelectItem } from "@heroui/react";
import { useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";

import { statusOptions } from "@/lib/constants/table";
import { UiState } from "@/lib/constants/uiState";
import useInvoiceFormSubmissionHandler from "@/lib/hooks/invoice/useInvoiceFormSubmissionHandler";
import { ClientModel } from "@/lib/types/models/client";
import { InvoiceModel } from "@/lib/types/models/invoice";
import {
  BankingInformationFormModel,
  UserModel,
} from "@/lib/types/models/user";
import { formatDate } from "@/lib/utils/formatDate";

import BankingInformationModal from "./banking-information-modal";
import InvoiceFormReceiverModal from "./InvoiceFormReceiverModal";
import InvoiceServicesTable from "./InvoiceServicesTable";
import SignaturePad from "../SignaturePad";
import CompleteProfile from "../ui/complete-profile";

type Props = {
  user: UserModel;
  invoiceData?: InvoiceModel;
  currency: string;
};

const INITIAL_RECEIVER_DATA: ClientModel = {
  businessNumber: "",
  businessType: "business",
  address: "",
  email: "",
  name: "",
  type: "receiver",
};

const InvoiceForm = ({ user, currency, invoiceData }: Props) => {
  const methods = useForm<InvoiceModel>({
    defaultValues: invoiceData || {
      sender: user,
      receiver: INITIAL_RECEIVER_DATA,
      services: [{ amount: 0, quantity: 0, description: "", unit: "" }],
    },
  });
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
    clearErrors,
    setValue,
    control,
  } = methods;

  const [uiState, setUiState] = useState(UiState.Idle);
  const [submissionMessage, setSubmissionMessage] = useState("");
  const [isReceiverModalOpen, setIsReceiverModalOpen] = useState(false);
  const [isBankingInformationModalOpen, setIsBankingInformationModalOpen] =
    useState(false);
  const [senderSignature, setSenderSignature] = useState<
    string | File | undefined
  >(invoiceData?.senderSignature);

  const { onSubmit, redirectToInvoicesPage } = useInvoiceFormSubmissionHandler({
    invoiceData,
    user,
    setUiState,
    setSubmissionMessage,
    setError,
  });

  const handleOpenReceiverModal = () => {
    setIsReceiverModalOpen(true);
  };

  const handleCloseReceiverModal = () => {
    setIsReceiverModalOpen(false);
  };

  const handleSelectReceiver = (receiver: ClientModel) => {
    setValue("receiver.name", receiver.name);
    setValue("receiver.businessNumber", receiver.businessNumber);
    setValue("receiver.address", receiver.address);
    setValue("receiver.email", receiver.email);
    setIsReceiverModalOpen(false);
  };

  const handleBankAccountSelect = (
    bankAccount: BankingInformationFormModel,
  ) => {
    setValue("bankingInformation.name", bankAccount.name);
    setValue("bankingInformation.code", bankAccount.code);
    setValue("bankingInformation.accountNumber", bankAccount.accountNumber);
    setIsBankingInformationModalOpen(false);
  };

  const handleSignatureChange = (signature: string | File) => {
    setSenderSignature(signature);
    setValue("senderSignature", signature);
    clearErrors("senderSignature");
  };

  const renderSenderAndReceiverFields = () => (
    <div className="col-span-4 flex flex-col w-full gap-4">
      <h4>Sender and Receiver Data</h4>
      <div className="col-span-4 flex w-full justify-between gap-4">
        <Card className="w-full p-4 flex flex-col gap-4">
          <div className="min-h-8 flex justify-between items-center">
            <p className="text-default-500 text-sm">From:</p>
          </div>
          <Input
            label="Sender's Name"
            size="sm"
            aria-label="Sender's Name"
            type="text"
            maxLength={20}
            variant="bordered"
            {...register("sender.name")}
            isInvalid={!!errors.sender?.name}
            errorMessage={errors.sender?.name?.message}
          />
          <Input
            label="Sender's Business Number"
            size="sm"
            aria-label="Sender's Business Number"
            type="text"
            maxLength={20}
            variant="bordered"
            {...register("sender.businessNumber")}
            isInvalid={!!errors.sender?.businessNumber}
            errorMessage={errors.sender?.businessNumber?.message}
          />
          <Input
            label="Sender's Address"
            size="sm"
            aria-label="Sender's Address"
            type="text"
            maxLength={20}
            variant="bordered"
            {...register("sender.address")}
            isInvalid={!!errors.sender?.address}
            errorMessage={errors.sender?.address?.message}
          />
          <Input
            label="Sender's Email"
            size="sm"
            aria-label="Sender's Email"
            type="text"
            maxLength={20}
            variant="bordered"
            {...register("sender.email")}
            isInvalid={!!errors.sender?.email}
            errorMessage={errors.sender?.email?.message}
          />
        </Card>
        <Card className="w-full flex flex-col gap-4 p-4">
          <div className="flex justify-between items-center">
            <p className="text-default-500 text-sm">To:</p>
            <Button
              size="sm"
              variant="faded"
              className="min-w-unit-10 w-unit-26 h-unit-8 cursor-pointer"
              onPress={handleOpenReceiverModal}
            >
              <UserGroupIcon className="w-4 h-4" />
              Select Client
            </Button>
          </div>
          <Controller
            name="receiver.name"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label="Receiver's Name"
                size="sm"
                aria-label="Receiver's Name"
                type="text"
                maxLength={20}
                variant="bordered"
                isInvalid={!!errors.receiver?.name}
                errorMessage={errors.receiver?.name?.message}
              />
            )}
          />
          <Controller
            name="receiver.businessNumber"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label="Receiver's Business Number"
                size="sm"
                aria-label="Receiver's Business Number"
                type="text"
                variant="bordered"
                isInvalid={!!errors.receiver?.businessNumber}
                errorMessage={errors.receiver?.businessNumber?.message}
              />
            )}
          />
          <Controller
            name="receiver.address"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label="Receiver's Address"
                size="sm"
                aria-label="Receiver's Address"
                type="text"
                variant="bordered"
                isInvalid={!!errors.receiver?.address}
                errorMessage={errors.receiver?.address?.message}
              />
            )}
          />
          <Controller
            name="receiver.email"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label="Receiver's Email"
                size="sm"
                aria-label="Receiver's Email"
                type="text"
                variant="bordered"
                isInvalid={!!errors.receiver?.email}
                errorMessage={errors.receiver?.email?.message}
              />
            )}
          />
        </Card>
      </div>
    </div>
  );

  const renderInvoiceServices = () => (
    <div className="flex gap-4 flex-col col-span-1 md:col-span-2 lg:col-span-4">
      <h4>Services</h4>
      <InvoiceServicesTable
        currency={currency}
        invoiceServices={invoiceData?.services}
        isInvalid={!!errors.services}
        errorMessage={errors.services?.message}
      />
    </div>
  );

  const renderBankingInformation = () => (
    <div className="flex gap-4 flex-col col-span-full">
      <div className="flex items-end justify-between">
        <h4>Banking Details</h4>
        <Button
          size="sm"
          variant="faded"
          className="min-w-unit-10 w-unit-26 h-unit-8 cursor-pointer"
          onPress={() => setIsBankingInformationModalOpen(true)}
        >
          <BuildingLibraryIcon className="w-4 h-4" />
          Select Bank Account
        </Button>
      </div>
      <div className="flex gap-4">
        <Controller
          name="bankingInformation.name"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              label="Bank Name"
              labelPlacement="inside"
              aria-label="Bank Name"
              type="text"
              placeholder="e.g., Swedbank"
              maxLength={20}
              variant="flat"
              isInvalid={!!errors.bankingInformation?.name}
              errorMessage={errors.bankingInformation?.name?.message}
            />
          )}
        />

        <Controller
          name="bankingInformation.code"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              label="Bank Code"
              aria-label="Bank Code"
              type="text"
              maxLength={20}
              placeholder="e.g., HABALT22"
              isInvalid={!!errors.bankingInformation?.code}
              errorMessage={errors.bankingInformation?.code?.message}
            />
          )}
        />

        <Controller
          name="bankingInformation.accountNumber"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              label="Bank Account Number"
              aria-label="Bank Account Number"
              placeholder="e.g., LT121000011101001000"
              type="text"
              maxLength={20}
              isInvalid={!!errors.bankingInformation?.accountNumber}
              errorMessage={errors.bankingInformation?.accountNumber?.message}
            />
          )}
        />
      </div>
    </div>
  );

  const renderInvoiceSignature = () => (
    <div className="flex gap-4 flex-col">
      <h4>Signature</h4>
      <SignaturePad
        signature={senderSignature}
        profileSignature={user?.signature as string | undefined}
        onSignatureChange={handleSignatureChange}
        isInvalid={!!errors.senderSignature}
        errorMessage={errors.senderSignature?.message}
        isChipVisible={user?.signature !== senderSignature}
      />
    </div>
  );

  const renderSubmissionMessageAndActions = () => (
    <div className="col-span-full flex w-full items-center gap-5 justify-between overflow-x-hidden">
      {submissionMessage && (
        <Chip color={uiState === UiState.Success ? "success" : "danger"}>
          {submissionMessage}
        </Chip>
      )}
      <div className="flex gap-1 justify-end w-full">
        <Button color="danger" variant="light" onPress={redirectToInvoicesPage}>
          Cancel
        </Button>
        <Button
          type="submit"
          isLoading={uiState === UiState.Pending}
          color="secondary"
        >
          Save
        </Button>
      </div>
    </div>
  );

  if (
    !user?.name ||
    !user?.businessNumber ||
    !user?.businessType ||
    !user?.address ||
    !user?.email
  )
    return <CompleteProfile title="invoice" />;

  return (
    <>
      <FormProvider {...methods}>
        <Card className="p-8 dark:border dark:border-default-100 bg-transparent">
          <form
            aria-label="Add New Invoice Form"
            className="w-full grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4"
            onSubmit={handleSubmit(onSubmit)}
            encType="multipart/form-data"
          >
            <div className="flex gap-4 flex-col col-span-full">
              <h4>Invoice Details</h4>
              <div className="flex gap-4">
                <Input
                  aria-label="Invoice ID"
                  {...register("invoiceId")}
                  label="Invoice ID"
                  placeholder="e.g., INV001"
                  defaultValue={invoiceData?.invoiceId || ""}
                  isInvalid={!!errors.invoiceId}
                  errorMessage={errors.invoiceId?.message}
                />
                <Select
                  aria-label="Status"
                  {...register("status")}
                  label="Status"
                  placeholder="Select status"
                  defaultSelectedKeys={
                    invoiceData?.status ? [`${invoiceData.status}`] : undefined
                  }
                  isInvalid={!!errors.status}
                  errorMessage={errors.status?.message}
                >
                  {statusOptions.map((option) => (
                    <SelectItem key={option.uid}>{option.name}</SelectItem>
                  ))}
                </Select>
                <Input
                  aria-label="Date"
                  {...register("date")}
                  type="date"
                  label="Date"
                  defaultValue={
                    invoiceData?.date ? formatDate(invoiceData.date) : ""
                  }
                  errorMessage={errors.date?.message}
                  isInvalid={!!errors.date}
                />
                <Input
                  aria-label="Due Date"
                  {...register("dueDate")}
                  type="date"
                  label="Due Date"
                  defaultValue={
                    invoiceData?.dueDate ? formatDate(invoiceData.dueDate) : ""
                  }
                  isInvalid={!!errors.dueDate}
                  errorMessage={errors.dueDate?.message}
                />
              </div>
            </div>
            {renderSenderAndReceiverFields()}
            {renderInvoiceServices()}
            {renderBankingInformation()}
            {renderInvoiceSignature()}
            {renderSubmissionMessageAndActions()}
          </form>
        </Card>
      </FormProvider>

      <InvoiceFormReceiverModal
        userId={user.id || 0}
        isOpen={isReceiverModalOpen}
        onClose={handleCloseReceiverModal}
        onReceiverSelect={handleSelectReceiver}
      />
      <BankingInformationModal
        userId={user.id || 0}
        isOpen={isBankingInformationModalOpen}
        onClose={() => setIsBankingInformationModalOpen(false)}
        onBankAccountSelect={handleBankAccountSelect}
      />
    </>
  );
};

export default InvoiceForm;
