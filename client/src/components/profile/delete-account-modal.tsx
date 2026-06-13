'use client';

import {
  Button,
  ModalBody,
  ModalFooter,
  ModalHeader,
  toast
} from '@heroui/react';
import { AppModal } from '@/components/ui/app-modal';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useTransition } from 'react';
import { useTranslations } from 'next-intl';

import { deleteUserAccount } from '@/api/user';
import { isResponseError } from '@/lib/utils/error';
import { logOutAction } from '@/lib/actions';

type Props = {
  userId: number;
  isOpen: boolean;
  onClose: () => void;
};

const DeleteAccountModal = ({ userId, isOpen, onClose }: Props) => {
  const t = useTranslations('profile.account_settings.delete_account.dialog');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async () =>
    startTransition(async () => {
      const response = await deleteUserAccount(userId);

      toast(response.data.message, {
        variant: isResponseError(response) ? 'danger' : 'success'
      });

      if (isResponseError(response)) return;

      logOutAction();
      onClose();
    });

  const renderModalFooter = () => (
    <ModalFooter>
      <div className="flex w-full items-center justify-between">
        <div className="flex w-full justify-end gap-1">
          <Button variant="outline" onPress={onClose}>
            {t('cancel_button')}
          </Button>
          <Button variant="danger" isPending={isPending} onPress={handleSubmit}>
            {t('confirm_button')}
          </Button>
        </div>
      </div>
    </ModalFooter>
  );

  return (
    <AppModal isOpen={isOpen} onClose={onClose}>
      <>
        <ModalHeader className="flex items-end gap-2">
          <ExclamationTriangleIcon className="text-danger-400 h-6 w-6" />
          {t('title')}
        </ModalHeader>
        <ModalBody>{t('description')}</ModalBody>
        {renderModalFooter()}
      </>
    </AppModal>
  );
};

export default DeleteAccountModal;
