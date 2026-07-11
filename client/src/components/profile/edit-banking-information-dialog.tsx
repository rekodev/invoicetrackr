import {
  Button,
  Input,
  Label,
  Modal,
  TextField,
  toast
} from '@heroui/react';
import { BankAccount } from '@invoicetrackr/types';
import { useTranslations } from 'next-intl';
import { ChangeEvent, useState, useTransition } from 'react';

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
    <Modal>
      <Modal.Backdrop isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
        <Modal.Container>
          <Modal.Dialog>
            <Modal.CloseTrigger />
        <Modal.Header>
          <Modal.Heading>{t('title.edit')}</Modal.Heading>
        </Modal.Header>
        <Modal.Body>
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
        </Modal.Body>
        <Modal.Footer>
          <div className="flex w-full flex-col items-start justify-between gap-5 overflow-x-hidden">
            <div className="flex w-full flex-col-reverse justify-end gap-2 sm:flex-row">
              <Button
                variant="danger-soft"
                className="w-full sm:w-auto"
                onPress={onClose}
              >
                {t('actions.cancel')}
              </Button>
              <Button
                isPending={isPending}
                className="w-full sm:w-auto"
                onPress={handleSubmit}
              >
                {t('actions.save')}
              </Button>
            </div>
          </div>
        </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
};

export default EditBankingInformationDialog;
