'use client';

import { SubmitHandler, UseFormSetError } from 'react-hook-form';
import { TransitionStartFunction } from 'react';
import { addToast } from '@heroui/react';
import { useRouter } from 'next/navigation';

import { addInvoiceAction, updateInvoiceAction } from '@/lib/actions/invoice';
import {
  BankingInformationFormModel,
  UserModel
} from '@/lib/types/models/user';
import { ClientModel } from '@/lib/types/models/client';
import { INVOICES_PAGE } from '@/lib/constants/pages';
import { InvoiceModel } from '@/lib/types/models/invoice';
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

      const response = invoiceData
        ? await updateInvoiceAction({
            userId: user.id,
            invoiceData: fullData,
            lang: user.language
          })
        : await addInvoiceAction({
            userId: user.id,
            invoiceData: fullData,
            lang: user.language
          });

      addToast({
        title: response.message || '',
        color: response.ok ? 'success' : 'danger'
      });

      if (!response.ok) {
        if (response.validationErrors) {
          Object.entries(response.validationErrors).forEach(([key, message]) => {
            setError(key as keyof InvoiceModel, { message });
          });
        }

        return;
      }

      redirectToInvoicesPage();
    });

  return { onSubmit, redirectToInvoicesPage };
};

export default useInvoiceFormSubmissionHandler;
