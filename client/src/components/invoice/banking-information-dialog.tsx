'use client';

import {
  BuildingLibraryIcon,
  PlusCircleIcon
} from '@heroicons/react/24/outline';
import { Button, Card, CardContent, Modal } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { BANKING_INFORMATION_PAGE } from '@/lib/constants/pages';
import { BankAccountBody } from '@invoicetrackr/types';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onBankAccountSelect: (_bankingInformation: BankAccountBody) => void;
  bankingInformationEntries?: Array<BankAccountBody>;
};

const BankingInformationDialog = ({
  isOpen,
  onClose,
  onBankAccountSelect,
  bankingInformationEntries
}: Props) => {
  const router = useRouter();
  const t = useTranslations('components.invoice_form');

  const renderBody = () => {
    if (!bankingInformationEntries?.length) {
      return <p className="text-default-500">{t('modals.no_bank_accounts')}</p>;
    }

    return bankingInformationEntries?.map((bankingInformation) => (
      <div
        key={bankingInformation.id}
        onClick={() => onBankAccountSelect(bankingInformation)}
      >
        <Card className="hover:bg-default-100/40 cursor-pointer justify-center">
          <CardContent className="flex min-h-[70px] min-w-72 flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="item-center rounded-medium border-default-200 flex border p-2">
                <BuildingLibraryIcon className="h-5 w-5" />
              </div>
              <div>
                <div className="truncate pb-0.5 text-sm font-bold uppercase">
                  {bankingInformation.name}
                </div>
                <div className="text-default-500 flex gap-2 text-xs">
                  <span>{bankingInformation.code}</span>
                  <span>{bankingInformation.accountNumber}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    ));
  };

  return (
    <Modal>
      <Modal.Backdrop
        isOpen={isOpen}
        onOpenChange={(open) => !open && onClose()}
      >
        <Modal.Container>
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>{t('modals.select_bank_account')}</Modal.Heading>
            </Modal.Header>
            <Modal.Body>{renderBody()}</Modal.Body>
            <Modal.Footer>
              <Button onPress={() => router.push(BANKING_INFORMATION_PAGE)}>
                <PlusCircleIcon className="h-5 w-5" />
                {t('buttons.add_new')}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
};

export default BankingInformationDialog;
