'use client';

import { addToast } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { TransitionStartFunction } from 'react';
import { SubmitHandler, UseFormSetError } from 'react-hook-form';

import { addInvoiceAction, updateInvoiceAction } from '@/lib/actions/invoice';
import { INVOICES_PAGE } from '@/lib/constants/pages';
import { ClientModel } from '@/lib/types/models/client';
import { InvoiceModel } from '@/lib/types/models/invoice';
import {
  BankingInformationFormModel,
  UserModel
} from '@/lib/types/models/user';
import { AddInvoiceResp, UpdateInvoiceResp } from '@/lib/types/response';
import { calculateServiceTotal } from '@/lib/utils';

const INITIAL_RECEIVER_DATA: ClientModel = {
  businessNumber: '',
  businessType: 'business',
  address: '',
  email: '',
  name: '',
  type: 'receiver'
};

type Props = {
  invoiceData: InvoiceModel | undefined;
  user: UserModel | undefined;
  bankingInformation?: BankingInformationFormModel;
  onTransitionStart: TransitionStartFunction;
  setError: UseFormSetError<InvoiceModel>;
};

const useInvoiceFormSubmissionHandler = ({
  invoiceData,
  user,
  bankingInformation,
  onTransitionStart,
  setError
}: Props) => {
  const router = useRouter();

  const redirectToInvoicesPage = () => {
    router.push(INVOICES_PAGE);
  };

  const onSubmit: SubmitHandler<InvoiceModel> = async (data) =>
    onTransitionStart(async () => {
      if (!user?.id) return;

      const fullData: typeof data = {
        ...data,
        sender: user,
        senderSignature: data.senderSignature || '',
        receiver: data?.receiver || INITIAL_RECEIVER_DATA,
        totalAmount: calculateServiceTotal(data.services),
        bankingInformation: bankingInformation || data.bankingInformation
      };

      let response: UpdateInvoiceResp | AddInvoiceResp;

      if (invoiceData) {
        response = await updateInvoiceAction({
          userId: user.id,
          invoiceData: fullData,
          lang: user.language
        });
      } else {
        response = await addInvoiceAction({
          userId: user.id,
          invoiceData: fullData,
          lang: user.language
        });
      }

      addToast({
        title: response.message,
        color: 'errors' in response ? 'danger' : 'success'
      });

      if ('errors' in response) {
        response.errors.forEach((error) => {
          setError(error.key, { message: error.value });
        });

        return;
      }

      redirectToInvoicesPage();
    });

  return { onSubmit, redirectToInvoicesPage };
};

export default useInvoiceFormSubmissionHandler;
