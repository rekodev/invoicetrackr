import { Dispatch, SetStateAction, useCallback, useState } from 'react';
import { InvoiceBody } from '@invoicetrackr/types';
import { useRouter } from 'next/navigation';

import { EDIT_INVOICE_PAGE } from '@/lib/constants/pages';

type Props = {
  setCurrentInvoice: Dispatch<SetStateAction<InvoiceBody | undefined>>;
  onOpen: () => void;
};

const useInvoiceTableActionHandlers = ({
  setCurrentInvoice,
  onOpen
}: Props) => {
  const router = useRouter();
  const [isDeleteInvoiceModalOpen, setIsDeleteInvoiceModalOpen] =
    useState(false);
  const [isSendInvoiceEmailModalOpen, setIsSendInvoiceEmailModalOpen] =
    useState(false);

  const handleViewInvoice = useCallback(
    (invoice: InvoiceBody) => {
      setCurrentInvoice(invoice);
      onOpen();
    },
    [onOpen, setCurrentInvoice]
  );

  const handleEditInvoice = useCallback(
    (invoice: InvoiceBody) => {
      setCurrentInvoice(invoice);
      router.push(EDIT_INVOICE_PAGE(Number(invoice.id)));
    },
    [router, setCurrentInvoice]
  );

  const handleCloseDeleteInvoiceModal = () => {
    setIsDeleteInvoiceModalOpen(false);
  };

  const handleCloseSendInvoiceEmailModal = () => {
    setIsSendInvoiceEmailModalOpen(false);
  };

  const handleDeleteInvoice = useCallback(
    (invoice: InvoiceBody) => {
      setCurrentInvoice(invoice);
      setIsDeleteInvoiceModalOpen(true);
    },
    [setCurrentInvoice]
  );

  const handleSendInvoiceEmail = useCallback(
    (invoice: InvoiceBody) => {
      setCurrentInvoice(invoice);
      setIsSendInvoiceEmailModalOpen(true);
    },
    [setCurrentInvoice]
  );

  return {
    handleViewInvoice,
    handleEditInvoice,
    handleDeleteInvoice,
    handleSendInvoiceEmail,
    isDeleteInvoiceModalOpen,
    isSendInvoiceEmailModalOpen,
    handleCloseDeleteInvoiceModal,
    handleCloseSendInvoiceEmailModal
  };
};

export default useInvoiceTableActionHandlers;
