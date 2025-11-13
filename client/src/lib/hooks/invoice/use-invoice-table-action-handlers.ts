import { useRouter } from 'next/navigation';
import { Dispatch, SetStateAction, useCallback, useState } from 'react';

import { EDIT_INVOICE_PAGE } from '@/lib/constants/pages';
import { Invoice } from '@invoicetrackr/types';

type Props = {
  setCurrentInvoice: Dispatch<SetStateAction<Invoice | undefined>>;
  onOpen: () => void;
};

const useInvoiceTableActionHandlers = ({
  setCurrentInvoice,
  onOpen
}: Props) => {
  const router = useRouter();
  const [isDeleteInvoiceModalOpen, setIsDeleteInvoiceModalOpen] =
    useState(false);

  const handleViewInvoice = useCallback(
    (invoice: Invoice) => {
      setCurrentInvoice(invoice);
      onOpen();
    },
    [onOpen, setCurrentInvoice]
  );

  const handleEditInvoice = useCallback(
    (invoice: Invoice) => {
      setCurrentInvoice(invoice);
      router.push(EDIT_INVOICE_PAGE(invoice.id));
    },
    [router, setCurrentInvoice]
  );

  const handleCloseDeleteInvoiceModal = () => {
    setIsDeleteInvoiceModalOpen(false);
  };

  const handleDeleteInvoice = useCallback(
    (invoice: Invoice) => {
      setCurrentInvoice(invoice);
      setIsDeleteInvoiceModalOpen(true);
    },
    [setCurrentInvoice]
  );

  return {
    handleViewInvoice,
    handleEditInvoice,
    handleDeleteInvoice,
    isDeleteInvoiceModalOpen,
    handleCloseDeleteInvoiceModal
  };
};

export default useInvoiceTableActionHandlers;
