import { Modal, ModalBody, ModalContent, ModalHeader } from '@heroui/react';
import { PDFViewer } from '@react-pdf/renderer';
import { useTranslations } from 'next-intl';

import { InvoiceModel } from '@/lib/types/models/invoice';

import PDFDocument from '../pdf/pdf-document';

type Props = {
  currency: string;
  language: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  invoiceData: InvoiceModel;
  senderSignatureImage: string;
};

const InvoiceModal = ({
  currency,
  language,
  isOpen,
  onOpenChange,
  invoiceData,
  senderSignatureImage
}: Props) => {
  const t = useTranslations('invoices.pdf');
  const { invoiceId } = invoiceData;

  return (
    <Modal
      className="max-h-[84.84vh] min-w-[50%] pb-3"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 pb-2">
          {invoiceId}
        </ModalHeader>
        <ModalBody className="overflow-y-scroll">
          <PDFViewer className="aspect-[210/297]">
            <PDFDocument
              t={t}
              language={language}
              currency={currency}
              invoiceData={invoiceData}
              senderSignatureImage={senderSignatureImage}
              bankAccount={invoiceData.bankingInformation}
            />
          </PDFViewer>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default InvoiceModal;
