import { AxiosResponse } from 'axios';
import { useRouter } from 'next/navigation';
import { Dispatch, SetStateAction } from 'react';
import { SubmitHandler } from 'react-hook-form';

import { addInvoice, updateInvoice } from '@/api';
import { INVOICES_PAGE } from '@/constants/pages';
import { UiState } from '@/constants/uiState';
import { ClientModel } from '@/types/models/client';
import { InvoiceModel, InvoiceService } from '@/types/models/invoice';
import { UserModel } from '@/types/models/user';
import { AddInvoiceResp, UpdateInvoiceResp } from '@/types/response';

import useGetInvoices from './useGetInvoices';

const calculateServiceTotal = (services: Array<InvoiceService>) =>
  services.reduce((acc, currentValue) => acc + Number(currentValue.amount), 0);

type Props = {
  invoiceData: InvoiceModel | undefined;
  user: UserModel | undefined;
  receiverData: ClientModel | undefined;
  setUiState: Dispatch<SetStateAction<UiState>>;
  setSubmissionMessage: Dispatch<SetStateAction<string>>;
};

const useInvoiceFormSubmissionHandler = ({
  invoiceData,
  user,
  receiverData,
  setUiState,
  setSubmissionMessage,
}: Props) => {
  const router = useRouter();
  const { mutateInvoices } = useGetInvoices();

  const redirectToInvoicesPage = () => {
    router.push(INVOICES_PAGE);
  };

  const onSubmit: SubmitHandler<InvoiceModel> = async (data) => {
    if (!user?.id || !receiverData) return;

    setSubmissionMessage('');
    const fullData: typeof data = {
      ...data,
      sender: user,
      receiver: receiverData || invoiceData?.receiver,
      totalAmount: calculateServiceTotal(data.services),
    };

    let response: AxiosResponse<UpdateInvoiceResp | AddInvoiceResp, any>;

    if (invoiceData) {
      response = await updateInvoice(user.id, fullData);
    } else {
      response = await addInvoice(user.id, fullData);
    }
    setSubmissionMessage(response.data.message);

    if ('error' in response.data) {
      setUiState(UiState.Failure);

      return;
    }

    setUiState(UiState.Success);
    mutateInvoices();
    redirectToInvoicesPage();
  };

  return { onSubmit, redirectToInvoicesPage };
};

export default useInvoiceFormSubmissionHandler;
