'use client';

import { BuildingLibraryIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
import { Button, Card, CardContent, Modal } from '@heroui/react';
import type { BankAccountBody } from '@invoicetrackr/types';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import BankAccountForm from '../profile/bank-account-form';

type DialogView = 'list' | 'add';

type Props = {
  userId: number;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (_bankAccount: BankAccountBody) => void;
  bankAccounts: Array<BankAccountBody>;
};

export default function PaymentMethodDialog({
  userId,
  isOpen,
  onClose,
  onSelect,
  bankAccounts
}: Props) {
  const t = useTranslations('components.invoice_form');
  const [view, setView] = useState<DialogView>('list');

  const handleClose = () => {
    setView('list');
    onClose();
  };

  const renderList = () => {
    if (!bankAccounts.length)
      return <p className="text-muted">{t('modals.no_payment_methods')}</p>;

    return (
      <div className="flex max-h-[60vh] flex-col items-stretch justify-start gap-2 overflow-y-auto pr-1">
        {bankAccounts.map((bankAccount) => (
          <button
            key={`bank-${bankAccount.id}`}
            type="button"
            className="block w-full shrink-0 text-left"
            onClick={() => onSelect(bankAccount)}
          >
            <Card className="hover:bg-muted/5 h-auto shrink-0 border hover:cursor-pointer">
              <CardContent className="flex w-full flex-row items-start justify-between gap-4 text-left">
                <div className="flex min-w-0 flex-row items-start gap-3 text-left">
                  <div className="border-default-200 bg-muted/5 flex shrink-0 rounded-md border p-2">
                    <BuildingLibraryIcon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="truncate text-sm font-bold">{bankAccount.name}</p>
                    <div className="text-muted flex min-w-0 flex-wrap gap-x-2 gap-y-0.5 text-xs">
                      <span>{bankAccount.code}</span>
                      <span className="break-all">{bankAccount.accountNumber}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </button>
        ))}
      </div>
    );
  };

  return (
    <Modal.Backdrop
      isOpen={isOpen}
      onOpenChange={(open) => !open && handleClose()}
    >
      <Modal.Container>
        <Modal.Dialog>
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>
              {t(
                view === 'add'
                  ? 'modals.add_payment_method'
                  : 'modals.select_payment_method'
              )}
            </Modal.Heading>
          </Modal.Header>
          <Modal.Body className="justify-start">
            {view === 'add' ? (
              <BankAccountForm
                userId={userId}
                variant="inline"
                shouldSelectOnCreate={!bankAccounts.length}
                onCancel={() => setView('list')}
                onSuccess={(bankAccount) => bankAccount && onSelect(bankAccount)}
              />
            ) : renderList()}
          </Modal.Body>
          {view === 'list' ? (
            <Modal.Footer>
              <Button
                className="w-full sm:w-auto"
                onPress={() => setView('add')}
              >
                <PlusCircleIcon className="h-5 w-5" />
                {t('modals.add_payment_method')}
              </Button>
            </Modal.Footer>
          ) : null}
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
