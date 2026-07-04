'use client';

import {
  BuildingLibraryIcon,
  PlusCircleIcon
} from '@heroicons/react/24/outline';
import { Button, Card, CardContent, Modal } from '@heroui/react';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

import { BankAccountBody } from '@invoicetrackr/types';

import BankAccountForm from '../profile/bank-account-form';

type Props = {
  userId: number;
  isOpen: boolean;
  onClose: () => void;
  onBankAccountSelect: (_bankingInformation: BankAccountBody) => void;
  bankingInformationEntries?: Array<BankAccountBody>;
};

const BankingInformationDialog = ({
  userId,
  isOpen,
  onClose,
  onBankAccountSelect,
  bankingInformationEntries
}: Props) => {
  const t = useTranslations('components.invoice_form');
  const [isAddingBankAccount, setIsAddingBankAccount] = useState(false);

  const handleClose = () => {
    setIsAddingBankAccount(false);
    onClose();
  };

  const handleBankAccountCreated = (bankAccount?: BankAccountBody) => {
    if (!bankAccount) return;

    onBankAccountSelect(bankAccount);
    setIsAddingBankAccount(false);
  };

  const renderBody = () => {
    if (isAddingBankAccount) {
      return (
        <BankAccountForm
          userId={userId}
          variant="inline"
          shouldSelectOnCreate={!bankingInformationEntries?.length}
          onCancel={() => setIsAddingBankAccount(false)}
          onSuccess={handleBankAccountCreated}
        />
      );
    }

    if (!bankingInformationEntries?.length) {
      return <p className="text-muted">{t('modals.no_bank_accounts')}</p>;
    }

    return (
      <div className="flex max-h-[60vh] flex-col gap-3 overflow-y-auto pr-1">
        {bankingInformationEntries?.map((bankingInformation) => (
          <div
            key={bankingInformation.id}
            onClick={() => onBankAccountSelect(bankingInformation)}
          >
            <Card className="hover:bg-muted/5 justify-center border hover:cursor-pointer">
              <CardContent className="flex min-h-[70px] w-full flex-row items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="item-center border-default-200 bg-muted/5 flex shrink-0 rounded-md border p-2">
                    <BuildingLibraryIcon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-default-foreground truncate pb-0.5 text-sm font-bold uppercase">
                      {bankingInformation.name}
                    </p>
                    <div className="text-muted flex min-w-0 flex-wrap gap-x-2 gap-y-0.5 text-xs">
                      <span>{bankingInformation.code}</span>
                      <span className="break-all">
                        {bankingInformation.accountNumber}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Modal>
      <Modal.Backdrop
        isOpen={isOpen}
        onOpenChange={(open) => !open && handleClose()}
      >
        <Modal.Container>
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>
                {isAddingBankAccount
                  ? t('modals.add_bank_account')
                  : t('modals.select_bank_account')}
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body>{renderBody()}</Modal.Body>
            {!isAddingBankAccount && (
              <Modal.Footer>
                <Button
                  className="w-full sm:w-auto"
                  onPress={() => setIsAddingBankAccount(true)}
                >
                  <PlusCircleIcon className="h-5 w-5" />
                  {t('buttons.add_new')}
                </Button>
              </Modal.Footer>
            )}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
};

export default BankingInformationDialog;
