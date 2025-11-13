'use client';

import { SubmitHandler, UseFormSetError } from 'react-hook-form';
import { addToast } from '@heroui/react';
import { useRouter } from 'next/navigation';

import { BankAccount, Client, InvoiceBody, User } from '@invoicetrackr/types';
import { addInvoiceAction, updateInvoiceAction } from '@/lib/actions/invoice';
import { INVOICES_PAGE } from '@/lib/constants/pages';
import { calculateServiceTotal } from '@/lib/utils';

const INITIAL_RECEIVER_DATA: Client = {
  id: 0,
  businessNumber: '',
  businessType: 'business',
  address: '',
  email: '',
  name: '',
  type: 'receiver'
};

type Props = {
  invoiceData: InvoiceBody | undefined;
  user: User | undefined;
  bankingInformation?: BankAccount;
  setError: UseFormSetError<InvoiceBody>;
};

const useInvoiceFormSubmissionHandler = ({
  invoiceData,
  user,
  bankingInformation,
  setError
}: Props) => {
  const router = useRouter();

  const redirectToInvoicesPage = () => {
    router.push(INVOICES_PAGE);
  };

  const onSubmit: SubmitHandler<InvoiceBody> = async (data) => {
    if (!user?.id) return;

    const fullData: typeof data = {
      ...data,
      sender: user,
      senderSignature: data.senderSignature || '',
      receiver: data?.receiver || INITIAL_RECEIVER_DATA,
      totalAmount: calculateServiceTotal(data.services).toString(),
      bankingInformation: bankingInformation || data.bankingInformation
    };

    const response = invoiceData
      ? await updateInvoiceAction({
          userId: user.id,
          invoiceData: fullData
        })
      : await addInvoiceAction({
          userId: user.id,
          invoiceData: fullData
        });

    addToast({
      title: response.message || '',
      color: response.ok ? 'success' : 'danger'
    });

    if (!response.ok) {
      if (response.validationErrors) {
        Object.entries(response.validationErrors).forEach(([key, message]) => {
          setError(key as keyof InvoiceBody, {
            message: message as string
          });
        });
      }

      return;
    }

    redirectToInvoicesPage();
  };

  return { onSubmit, redirectToInvoicesPage };
};

export default useInvoiceFormSubmissionHandler;
