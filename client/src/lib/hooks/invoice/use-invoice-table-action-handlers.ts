import { useRouter } from 'next/navigation';
import { Dispatch, SetStateAction, useCallback, useState } from 'react';

import { EDIT_INVOICE_PAGE } from '@/lib/constants/pages';
import { InvoiceModel } from '@/lib/types/models/invoice';

type Props = {
  setCurrentInvoice: Dispatch<SetStateAction<InvoiceModel | undefined>>;
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
    (invoice: InvoiceModel) => {
      setCurrentInvoice(invoice);
      onOpen();
    },
    [onOpen, setCurrentInvoice]
  );

  const handleEditInvoice = useCallback(
    (invoice: InvoiceModel) => {
      setCurrentInvoice(invoice);
      router.push(EDIT_INVOICE_PAGE(invoice.id));
    },
    [router, setCurrentInvoice]
  );

  const handleCloseDeleteInvoiceModal = () => {
    setIsDeleteInvoiceModalOpen(false);
  };

  const handleDeleteInvoice = useCallback(
    (invoice: InvoiceModel) => {
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
