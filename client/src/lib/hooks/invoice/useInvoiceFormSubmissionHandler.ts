import { AxiosResponse } from "axios";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction } from "react";
import { SubmitHandler, UseFormSetError } from "react-hook-form";

import { addInvoice, updateInvoice } from "@/api";
import { INVOICES_PAGE } from "@/lib/constants/pages";
import { UiState } from "@/lib/constants/uiState";
import { ClientModel } from "@/lib/types/models/client";
import { InvoiceModel } from "@/lib/types/models/invoice";
import {
  BankingInformationFormModel,
  UserModel,
} from "@/lib/types/models/user";
import { AddInvoiceResp, UpdateInvoiceResp } from "@/lib/types/response";
import { calculateServiceTotal } from "@/lib/utils";

import useGetInvoice from "./useGetInvoice";
import useGetInvoices from "./useGetInvoices";

const INITIAL_RECEIVER_DATA: ClientModel = {
  businessNumber: "",
  businessType: "business",
  address: "",
  email: "",
  name: "",
  type: "receiver",
};

type Props = {
  invoiceData: InvoiceModel | undefined;
  user: UserModel | undefined;
  bankingInformation?: BankingInformationFormModel;
  setUiState: Dispatch<SetStateAction<UiState>>;
  setSubmissionMessage: Dispatch<SetStateAction<string>>;
  setError: UseFormSetError<InvoiceModel>;
};

const useInvoiceFormSubmissionHandler = ({
  invoiceData,
  user,
  bankingInformation,
  setUiState,
  setSubmissionMessage,
  setError,
}: Props) => {
  const router = useRouter();
  const { mutateInvoices } = useGetInvoices({ userId: user?.id || 0 });
  const { mutateInvoice } = useGetInvoice({
    userId: user?.id || 0,
    invoiceId: invoiceData?.id,
  });

  const redirectToInvoicesPage = () => {
    router.push(INVOICES_PAGE);
  };

  const onSubmit: SubmitHandler<InvoiceModel> = async (data) => {
    if (!user?.id) return;

    setSubmissionMessage("");
    setUiState(UiState.Pending);

    const fullData: typeof data = {
      ...data,
      sender: user,
      senderSignature: data.senderSignature || "",
      receiver: data?.receiver || INITIAL_RECEIVER_DATA,
      totalAmount: calculateServiceTotal(data.services),
      bankingInformation: bankingInformation || data.bankingInformation,
    };

    let response: AxiosResponse<UpdateInvoiceResp | AddInvoiceResp>;

    if (invoiceData) {
      response = await updateInvoice(user.id, fullData, user.language);
    } else {
      response = await addInvoice(user.id, fullData, user.language);
    }
    setSubmissionMessage(response.data.message);

    if ("errors" in response.data) {
      setUiState(UiState.Failure);

      response.data.errors.forEach((error) => {
        setError(error.key, { message: error.value });
      });

      return;
    }

    setUiState(UiState.Success);
    mutateInvoices();
    mutateInvoice();
    redirectToInvoicesPage();
  };

  return { onSubmit, redirectToInvoicesPage };
};

export default useInvoiceFormSubmissionHandler;
