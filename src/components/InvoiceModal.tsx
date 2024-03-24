import { Modal, ModalBody, ModalContent, ModalHeader } from '@nextui-org/react';
import { PDFViewer } from '@react-pdf/renderer';

import { InvoiceModel } from '@/types/models/invoice';

import Pdf from './Pdf';

type Props = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  invoiceContent: InvoiceModel;
};

const InvoiceModal = ({ isOpen, onOpenChange, invoiceContent }: Props) => {
  const { name } = invoiceContent;

  return (
    <Modal
      className='h-[84.84vh] w-[90%] max-w-md min-w-[60%] pb-2 max-h-[978px]'
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        <ModalHeader className='flex flex-col gap-1 pb-2'>{name}</ModalHeader>
        <ModalBody>
          <div className='w-full h-full'>
            <PDFViewer className='h-full w-full'>
              <Pdf />
            </PDFViewer>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default InvoiceModal;
