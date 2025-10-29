'use client';

import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import {
  addToast,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader
} from '@heroui/react';
import { User } from 'next-auth';
import { useTranslations } from 'next-intl';
import { useTransition } from 'react';

import { cancelStripeSubscription } from '@/api';
import { updateSession } from '@/lib/actions';
import { RENEW_SUBSCRIPTION_PAGE } from '@/lib/constants/pages';

type Props = {
  user: User;
  isOpen: boolean;
  onClose: () => void;
};

const CancelSubscriptionModal = ({ user, isOpen, onClose }: Props) => {
  const t = useTranslations(
    'profile.account_settings.subscription.cancel_subscription_dialog'
  );
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async () =>
    startTransition(async () => {
      if (!user) return;

      const response = await cancelStripeSubscription(Number(user.id));

      addToast({
        title: response.data.message,
        color: 'errors' in response.data ? 'danger' : 'success'
      });

      if ('errors' in response.data) return;

      await updateSession({
        newSession: {
          ...user,
          id: String(user.id),
          isSubscriptionActive: false
        },
        redirectPath: RENEW_SUBSCRIPTION_PAGE
      });
    });

  const renderModalFooter = () => (
    <ModalFooter>
      <div className="flex w-full items-center justify-between">
        <div className="flex w-full justify-end gap-1">
          <Button variant="bordered" onPress={onClose}>
            {t('cancel_button')}
          </Button>
          <Button isLoading={isPending} color="danger" onPress={handleSubmit}>
            {t('confirm_button')}
          </Button>
        </div>
      </div>
    </ModalFooter>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex items-end gap-2">
          <ExclamationTriangleIcon className="text-danger-400 h-6 w-6" />
          {t('title')}
        </ModalHeader>
        <ModalBody>{t('description')}</ModalBody>
        {renderModalFooter()}
      </ModalContent>
    </Modal>
  );
};

export default CancelSubscriptionModal;
