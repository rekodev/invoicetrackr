import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@nextui-org/react';
import { PDFViewer } from '@react-pdf/renderer';

import { InvoiceModel } from '@/types/models/invoice';

import MyDocument from './MyDocument';

type Props = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  invoiceContent: InvoiceModel;
};

const InvoiceModal = ({ isOpen, onOpenChange, invoiceContent }: Props) => {
  const { date, price } = invoiceContent;

  return (
    <Modal
      className='h-[84.84vh] w-[90%] max-w-md min-w-[60%] pb-2 max-h-[986px]'
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        <ModalHeader className='flex flex-col gap-1'>Modal Title</ModalHeader>
        <ModalBody>
          <div className='w-full h-full'>
            <PDFViewer className='h-full w-full'>
              <MyDocument date={date} price={price} />
            </PDFViewer>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default InvoiceModal;
