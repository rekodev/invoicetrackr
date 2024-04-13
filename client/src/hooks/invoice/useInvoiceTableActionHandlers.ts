import { Dispatch, SetStateAction, useCallback, useState } from 'react';

import { InvoiceModel } from '@/types/models/invoice';

type Props = {
  setCurrentInvoice: Dispatch<SetStateAction<InvoiceModel | undefined>>;
  onOpen: () => void;
};

const useInvoiceTableActionHandlers = ({
  setCurrentInvoice,
  onOpen,
}: Props) => {
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
      // TODO: Finish implementing
    },
    [setCurrentInvoice]
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
    handleCloseDeleteInvoiceModal,
  };
};

export default useInvoiceTableActionHandlers;
