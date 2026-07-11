'use client';

import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import {
  Button,
  Modal,
  toast
} from '@heroui/react';
import { useTranslations } from 'next-intl';
import { useTransition } from 'react';

import { deleteUserAccount } from '@/api/user';
import { logOutAction } from '@/lib/actions';
import { isResponseError } from '@/lib/utils/error';

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
    <Modal.Footer>
      <div className="flex w-full items-center justify-between">
        <div className="flex w-full flex-col-reverse justify-end gap-2 sm:flex-row">
          <Button
            className="w-full sm:w-auto"
            variant="outline"
            onPress={onClose}
          >
            {t('cancel_button')}
          </Button>
          <Button
            variant="danger"
            isPending={isPending}
            className="w-full sm:w-auto"
            onPress={handleSubmit}
          >
            {t('confirm_button')}
          </Button>
        </div>
      </div>
    </Modal.Footer>
  );

  return (
    <Modal>
      <Modal.Backdrop isOpen={isOpen} onOpenChange={(open) => !open && onClose()}>
        <Modal.Container>
          <Modal.Dialog>
            <Modal.CloseTrigger />
        <Modal.Header className="flex items-end gap-2">
          <ExclamationTriangleIcon className="text-danger-400 h-6 w-6" />
          <Modal.Heading>{t('title')}</Modal.Heading>
        </Modal.Header>
        <Modal.Body>{t('description')}</Modal.Body>
        {renderModalFooter()}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
};

export default DeleteAccountModal;
