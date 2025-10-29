import {
  addToast,
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader
} from '@heroui/react';
import { useTranslations } from 'next-intl';
import { ChangeEvent, useState, useTransition } from 'react';

import { updateBankingInformationAction } from '@/lib/actions/banking-information';
import { BankingInformationFormModel } from '@/lib/types/models/user';

type Props = {
  userId: number;
  isOpen: boolean;
  onClose: () => void;
  bankingInformation: BankingInformationFormModel;
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
    useState<BankingInformationFormModel>(bankingInformation);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    field: keyof Omit<BankingInformationFormModel, 'id'>
  ) => {
    setNewBankingInformation((prev) => ({
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

      addToast({
        title: response.message,
        color: 'errors' in response ? 'danger' : 'success'
      });

      if (!response.ok) return;

      onClose();
    });

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>{t('title.edit')}</ModalHeader>
        <ModalBody>
          <Input
            value={newBankingInformation.name}
            onChange={(event) => handleChange(event, 'name')}
            type="text"
            label={t('bank_name')}
            placeholder={t('bank_name_placeholder')}
            variant="bordered"
          />
          <Input
            value={newBankingInformation.code}
            onChange={(event) => handleChange(event, 'code')}
            type="text"
            label={t('bank_code')}
            placeholder={t('bank_code_placeholder')}
            variant="bordered"
          />
          <Input
            value={newBankingInformation.accountNumber}
            onChange={(event) => handleChange(event, 'accountNumber')}
            type="text"
            label={t('bank_account_number')}
            placeholder={t('bank_account_number_placeholder')}
            variant="bordered"
          />
        </ModalBody>
        <ModalFooter>
          <div className="flex w-full flex-col items-start justify-between gap-5 overflow-x-hidden">
            <div className="flex w-full justify-end gap-1">
              <Button color="danger" variant="light" onPress={onClose}>
                {t('actions.cancel')}
              </Button>
              <Button
                isLoading={isPending}
                color="secondary"
                onPress={handleSubmit}
              >
                {t('actions.save')}
              </Button>
            </div>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditBankingInformationDialog;
