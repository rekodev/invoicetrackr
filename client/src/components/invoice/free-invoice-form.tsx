"use client";

import { EyeIcon } from "@heroicons/react/24/outline";
import { Button, Card, Input, Select, SelectItem } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { HOME_PAGE } from "@/lib/constants/pages";
import { statusOptions } from "@/lib/constants/table";
import { InvoiceModel } from "@/lib/types/models/invoice";

import InvoiceServicesTable from "./InvoiceServicesTable";
import SignaturePad from "../SignaturePad";
import InvoiceModal from "./InvoiceModal";

const FreeInvoiceForm = () => {
  const router = useRouter();
  const methods = useForm<InvoiceModel>({
    defaultValues: {
      services: [{ amount: 0, quantity: 0, description: "", unit: "" }],
    },
  });
  const {
    register,
    formState: { errors },
    clearErrors,
    setValue,
    getValues,
  } = methods;

  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [senderSignature, setSenderSignature] = useState<
    string | File | undefined
  >();

  const senderSignatureImage =
    !senderSignature || typeof senderSignature === "string"
      ? ""
      : URL.createObjectURL(senderSignature);

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
          <p className="text-default-500 text-sm">From:</p>
          <Input
            label="Sender's Name"
            size="sm"
            aria-label="Sender's Name"
            type="text"
            maxLength={20}
            defaultValue=""
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
            defaultValue=""
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
            defaultValue=""
            variant="bordered"
            {...register("sender.address")}
            isInvalid={!!errors.sender?.address}
            errorMessage={errors.sender?.address?.message}
          />
          <Input
            label="Sender's Email"
            size="sm"
            aria-label="Unit"
            type="text"
            maxLength={20}
            defaultValue=""
            variant="bordered"
            {...register("sender.email")}
            isInvalid={!!errors.sender?.email}
            errorMessage={errors.sender?.email?.message}
          />
        </Card>
        <Card className="w-full flex flex-col gap-4 p-4">
          <p className="text-default-500 text-sm">To:</p>
          <Input
            label="Receiver's Name"
            size="sm"
            aria-label="Receiver's Name"
            type="text"
            maxLength={20}
            defaultValue=""
            variant="bordered"
            {...register("receiver.name")}
            isInvalid={!!errors.receiver?.name}
            errorMessage={errors.receiver?.name?.message}
          />
          <Input
            label="Receiver's Business Number"
            size="sm"
            aria-label="Receiver's Business Number"
            type="text"
            maxLength={20}
            defaultValue=""
            variant="bordered"
            {...register("receiver.businessNumber")}
            isInvalid={!!errors.receiver?.businessNumber}
            errorMessage={errors.receiver?.businessNumber?.message}
          />
          <Input
            label="Receiver's Address"
            size="sm"
            aria-label="Receiver's Address"
            type="text"
            maxLength={20}
            defaultValue=""
            variant="bordered"
            {...register("receiver.address")}
            isInvalid={!!errors.receiver?.address}
            errorMessage={errors.receiver?.address?.message}
          />
          <Input
            label="Receiver's Email"
            size="sm"
            aria-label="Receiver's Email"
            type="text"
            maxLength={20}
            defaultValue=""
            variant="bordered"
            {...register("receiver.email")}
            isInvalid={!!errors.receiver?.email}
            errorMessage={errors.receiver?.email?.message}
          />
        </Card>
      </div>
    </div>
  );

  const renderInvoiceServices = () => (
    <div className="flex gap-4 flex-col col-span-1 md:col-span-2 lg:col-span-4">
      <h4>Services</h4>
      <InvoiceServicesTable
        currency="usd"
        isInvalid={!!errors.services}
        errorMessage={errors.services?.message}
      />
    </div>
  );

  const renderBankingInformation = () => (
    <div className="flex gap-4 flex-col col-span-full">
      <h4>Banking Details</h4>
      <div className="flex gap-4">
        <Input
          label="Bank Name"
          labelPlacement="inside"
          aria-label="Bank Name"
          type="text"
          placeholder="e.g.: Swedbank"
          maxLength={20}
          defaultValue=""
          variant="flat"
          {...register("bankingInformation.name")}
          isInvalid={!!errors.bankingInformation?.name}
          errorMessage={errors.bankingInformation?.name?.message}
        />
        <Input
          label="Bank Code"
          aria-label="Bank Code"
          type="text"
          maxLength={20}
          placeholder="e.g.: HABALT22"
          defaultValue=""
          {...register("receiver.address")}
          isInvalid={!!errors.bankingInformation?.code}
          errorMessage={errors.bankingInformation?.code?.message}
        />
        <Input
          label="Bank Account Number"
          aria-label="Bank Account Number"
          placeholder="e.g.: LT121000011101001000"
          type="text"
          maxLength={20}
          defaultValue=""
          {...register("bankingInformation.accountNumber")}
          isInvalid={!!errors.bankingInformation?.accountNumber}
          errorMessage={errors.bankingInformation?.accountNumber?.message}
        />
      </div>
    </div>
  );

  const renderInvoiceSignature = () => (
    <div className="flex gap-4 flex-col">
      <h4>Signature</h4>
      <SignaturePad
        signature={senderSignature}
        onSignatureChange={handleSignatureChange}
        isInvalid={!!errors.senderSignature}
        errorMessage={errors.senderSignature?.message}
      />
    </div>
  );

  const renderSubmissionMessageAndActions = () => (
    <div className="col-span-full flex w-full items-center gap-5 justify-between overflow-x-hidden">
      <div className="flex gap-1 justify-end w-full">
        <Button
          color="danger"
          variant="light"
          onPress={() => router.push(HOME_PAGE)}
        >
          Cancel
        </Button>
        <Button
          type="button"
          color="secondary"
          onPress={() => setIsInvoiceModalOpen(true)}
        >
          <EyeIcon className="h-5 w-5" />
          Preview
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <FormProvider {...methods}>
        <div className="px-6 pb-6 mx-auto max-w-5xl">
          <div className="flex flex-col gap-2">
            <h1 className="text-white text-3xl font-semibold">
              Create Invoice
            </h1>
            <p className="text-default-500">
              Create, preview and download an invoice for free
            </p>
          </div>
          <Card className="mt-8 p-8 border border-neutral-800 bg-transparent">
            <form
              aria-label="Add New Invoice Form"
              className="w-full grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
              encType="multipart/form-data"
            >
              <h4 className="col-span-4">Invoice Details</h4>
              <Input
                aria-label="Invoice ID"
                {...register("invoiceId")}
                label="Invoice ID"
                placeholder="e.g., INV001"
                defaultValue=""
                isInvalid={!!errors.invoiceId}
                errorMessage={errors.invoiceId?.message}
              />
              <Select
                aria-label="Status"
                {...register("status")}
                label="Status"
                placeholder="Select status"
                defaultSelectedKeys={undefined}
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
                defaultValue=""
                errorMessage={errors.date?.message}
                isInvalid={!!errors.date}
              />
              <Input
                aria-label="Due Date"
                {...register("dueDate")}
                type="date"
                label="Due Date"
                defaultValue=""
                isInvalid={!!errors.dueDate}
                errorMessage={errors.dueDate?.message}
              />
              {renderSenderAndReceiverFields()}
              {renderInvoiceServices()}
              {renderBankingInformation()}
              {renderInvoiceSignature()}
              {renderSubmissionMessageAndActions()}
            </form>
          </Card>
        </div>
      </FormProvider>

      <InvoiceModal
        userId={undefined}
        invoiceData={getValues()}
        currency="usd"
        language="en"
        isOpen={isInvoiceModalOpen}
        senderSignatureImage={senderSignatureImage}
        onOpenChange={setIsInvoiceModalOpen}
      />
    </>
  );
};

export default FreeInvoiceForm;
