'use client';

import type { SubmitHandler, UseFormSetError } from 'react-hook-form';
import { useRouter } from 'next/navigation';

import type { BankAccount, InvoiceBody, User } from '@invoicetrackr/types';
import { addInvoiceAction, updateInvoiceAction } from '@/lib/actions/invoice';
import { INVOICES_PAGE } from '@/lib/constants/pages';
import { calculateInvoiceTotals } from '@/lib/utils';
import { toast } from '@heroui/react';

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

    const invoiceTotals = calculateInvoiceTotals(data.services);
    const paymentMode = data.paymentMode || 'manual';

    const fullData: typeof data = {
      ...data,
      senderSignature: data.senderSignature || '',
      subtotalAmount: invoiceTotals.subtotalAmount,
      vatAmount: invoiceTotals.vatAmount,
      totalAmount: invoiceTotals.totalAmount,
      bankingInformation:
        paymentMode === 'disabled'
          ? undefined
          : bankingInformation || data.bankingInformation
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

    toast(response.message, { variant: response.ok ? 'success' : 'danger' });

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
