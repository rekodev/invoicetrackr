"use client";

import {
  Button,
  Card,
  Chip,
  Input,
  Select,
  SelectItem,
} from "@heroui/react";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { statusOptions } from "@/lib/constants/table";
import { UiState } from "@/lib/constants/uiState";
import useInvoiceFormSubmissionHandler from "@/lib/hooks/invoice/useInvoiceFormSubmissionHandler";
import useGetUser from "@/lib/hooks/user/useGetUser";
import { ClientModel } from "@/lib/types/models/client";
import { InvoiceModel } from "@/lib/types/models/invoice";
import { BankingInformationFormModel } from "@/lib/types/models/user";
import { formatDate } from "@/lib/utils/formatDate";

import BankingInformationSelect from "./BankingInformationSelect";
import InvoiceFormReceiverModal from "./InvoiceFormReceiverModal";
import InvoicePartyCard from "./InvoicePartyCard";
import InvoiceServicesTable from "./InvoiceServicesTable";
import PencilIcon from "../icons/PencilIcon";
import { PlusIcon } from "../icons/PlusIcon";
import SignaturePad from "../SignaturePad";
import CompleteProfile from "../ui/complete-profile";
import ErrorAlert from "../ui/error-alert";
import Loader from "../ui/loader";

type Props = {
  userId: number;
  invoiceData?: InvoiceModel;
  currency: string;
};

const InvoiceForm = ({ userId, currency, invoiceData }: Props) => {
  const { user, isUserLoading, userError } = useGetUser({ userId });
  const methods = useForm<InvoiceModel>({
    defaultValues: invoiceData || {
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
  } = methods;

  const [receiverData, setReceiverData] = useState<ClientModel | undefined>(
    invoiceData?.receiver,
  );
  const [uiState, setUiState] = useState(UiState.Idle);
  const [submissionMessage, setSubmissionMessage] = useState("");
  const [isReceiverModalOpen, setIsReceiverModalOpen] = useState(false);
  const [senderSignature, setSenderSignature] = useState<
    string | File | undefined
  >(invoiceData?.senderSignature);
  const [bankingInformation, setBankingInformation] = useState<
    BankingInformationFormModel | undefined
  >(invoiceData?.bankingInformation);

  const { onSubmit, redirectToInvoicesPage } = useInvoiceFormSubmissionHandler({
    invoiceData,
    userId,
    user,
    receiverData,
    bankingInformation,
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
    setReceiverData(receiver);
    setIsReceiverModalOpen(false);
    clearErrors("receiver");
  };

  const handleSignatureChange = (signature: string | File) => {
    setSenderSignature(signature);
    setValue("senderSignature", signature);
    clearErrors("senderSignature");
  };

  const renderReceiverActions = () => (
    <div className="absolute right-2 top-2 flex gap-1.5 z-10">
      {receiverData ? (
        <Button
          variant="faded"
          className="min-w-unit-10 w-unit-26 h-unit-8 cursor-pointer"
          onPress={handleOpenReceiverModal}
        >
          <PencilIcon width={4} height={4} />
          Change
        </Button>
      ) : (
        <Button
          variant="faded"
          className="min-w-unit-10 w-22 h-unit-8 cursor-pointer"
          onPress={handleOpenReceiverModal}
        >
          <PlusIcon width={4} height={4} />
          Add
        </Button>
      )}
    </div>
  );

  const renderSenderAndReceiverCards = () => (
    <div className="col-span-1 flex gap-4 w-full flex-col md:col-span-2 lg:col-span-4 md:flex-row">
      <InvoicePartyCard insideForm partyType="sender" partyData={user} />
      <InvoicePartyCard
        insideForm
        partyType="receiver"
        partyData={receiverData}
        renderActions={renderReceiverActions}
        isInvalid={!!errors.receiver}
        errorMessage={errors.receiver?.message}
      />
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
      <h4>Banking Details</h4>
      <BankingInformationSelect
        userId={userId}
        setSelectedBankAccount={setBankingInformation}
        existingBankAccount={invoiceData?.bankingInformation}
      />
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

  if (isUserLoading) return <Loader />;

  if (
    !user?.name ||
    !user?.businessNumber ||
    !user?.businessType ||
    !user?.address ||
    !user?.email
  )
    return <CompleteProfile title="invoice" />;

  if (userError) return <ErrorAlert />;

  return (
    <>
      <FormProvider {...methods}>
        <Card className="p-8 border border-neutral-800 bg-transparent">
          <form
            aria-label="Add New Invoice Form"
            className="w-full grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
            onSubmit={handleSubmit(onSubmit)}
            encType="multipart/form-data"
          >
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
            {renderSenderAndReceiverCards()}
            {renderInvoiceServices()}
            {renderBankingInformation()}
            {renderInvoiceSignature()}
            {renderSubmissionMessageAndActions()}
          </form>
        </Card>
      </FormProvider>

      <InvoiceFormReceiverModal
        userId={userId}
        isOpen={isReceiverModalOpen}
        onClose={handleCloseReceiverModal}
        onReceiverSelect={handleSelectReceiver}
      />
    </>
  );
};

export default InvoiceForm;
