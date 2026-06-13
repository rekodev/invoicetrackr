import {
  Button,
  Input,
  Label,
  ModalBody,
  ModalFooter,
  ModalHeader,
  TextField,
  toast
} from '@heroui/react';
import { ChangeEvent, useState, useTransition } from 'react';
import { AppModal } from '@/components/ui/app-modal';
import { useTranslations } from 'next-intl';

import { BankAccount } from '@invoicetrackr/types';
import { updateBankingInformationAction } from '@/lib/actions/banking-information';

type Props = {
  userId: number;
  isOpen: boolean;
  onClose: () => void;
  bankingInformation: BankAccount;
};

const EditBankingInformationDialog = ({
  userId,
  isOpen,
  onClose,
  bankingInformation
}: Props) => {
  const t = useTranslations('profile.banking_information.form');
  const [isPending, startTransition] = useTransition();
  const [newBankingInformation, setNewBankingInformation] =
    useState<BankAccount>(bankingInformation);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    field: keyof BankAccount
  ) => {
    setNewBankingInformation((prev: BankAccount) => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmit = async () =>
    startTransition(async () => {
      const response = await updateBankingInformationAction(
        userId,
        newBankingInformation
      );

      toast(response.message, {
        variant: response.ok ? 'success' : 'danger'
      });

      if (!response.ok) return;

      onClose();
    });

  return (
    <AppModal isOpen={isOpen} onClose={onClose}>
      <>
        <ModalHeader>{t('title.edit')}</ModalHeader>
        <ModalBody>
          <TextField variant="secondary">
            <Label>{t('bank_name')}</Label>
            <Input
              value={newBankingInformation.name}
              onChange={(event) => handleChange(event, 'name')}
              type="text"
              placeholder={t('bank_name_placeholder')}
            />
          </TextField>
          <TextField variant="secondary">
            <Label>{t('bank_code')}</Label>
            <Input
              value={newBankingInformation.code}
              onChange={(event) => handleChange(event, 'code')}
              type="text"
              placeholder={t('bank_code_placeholder')}
            />
          </TextField>
          <TextField variant="secondary">
            <Label>{t('bank_account_number')}</Label>
            <Input
              value={newBankingInformation.accountNumber}
              onChange={(event) => handleChange(event, 'accountNumber')}
              type="text"
              placeholder={t('bank_account_number_placeholder')}
            />
          </TextField>
        </ModalBody>
        <ModalFooter>
          <div className="flex w-full flex-col items-start justify-between gap-5 overflow-x-hidden">
            <div className="flex w-full justify-end gap-1">
              <Button variant="danger-soft" onPress={onClose}>
                {t('actions.cancel')}
              </Button>
              <Button isPending={isPending} onPress={handleSubmit}>
                {t('actions.save')}
              </Button>
            </div>
          </div>
        </ModalFooter>
      </>
    </AppModal>
  );
};

export default EditBankingInformationDialog;
