'use client';

import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  addToast
} from '@heroui/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { User } from 'next-auth';
import { useTransition } from 'react';
import { useTranslations } from 'next-intl';

import { RENEW_SUBSCRIPTION_PAGE } from '@/lib/constants/pages';
import { cancelStripeSubscription } from '@/api';
import { isResponseError } from '@/lib/utils/error';
import { updateSessionAction } from '@/lib/actions';

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
        color: isResponseError(response) ? 'danger' : 'success'
      });

      if (isResponseError(response)) return;

      await updateSessionAction({
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
