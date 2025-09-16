'use client';

import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import {
  Button,
  Chip,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader
} from '@heroui/react';
import { User } from 'next-auth';
import { useState } from 'react';

import { cancelStripeSubscription } from '@/api';
import { updateSession } from '@/lib/actions';
import { RENEW_SUBSCRIPTION_PAGE } from '@/lib/constants/pages';
import { UiState } from '@/lib/constants/ui-state';

type Props = {
  user: User;
  isOpen: boolean;
  onClose: () => void;
};

const CancelSubscriptionModal = ({ user, isOpen, onClose }: Props) => {
  const [uiState, setUiState] = useState(UiState.Idle);
  const [submissionMessage, setSubmissionMessage] = useState('');

  const handleSubmit = async () => {
    if (!user) return;

    setUiState(UiState.Pending);

    const response = await cancelStripeSubscription(Number(user.id));
    setSubmissionMessage(response.data.message);

    if ('errors' in response.data) {
      setUiState(UiState.Failure);

      return;
    }

    await updateSession({
      newSession: { ...user, id: String(user.id), isSubscriptionActive: false },
      redirectPath: RENEW_SUBSCRIPTION_PAGE
    });
  };

  const renderModalFooter = () => (
    <ModalFooter>
      <div className="flex w-full items-center justify-between">
        {submissionMessage && (
          <Chip color={uiState === UiState.Success ? 'success' : 'danger'}>
            {submissionMessage}
          </Chip>
        )}
        <div className="flex w-full justify-end gap-1">
          <Button color="danger" variant="bordered" onPress={onClose}>
            Go Back
          </Button>
          <Button
            isLoading={uiState === UiState.Pending}
            color="danger"
            onPress={handleSubmit}
          >
            Cancel Subscription
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
          Cancel Subscription?
        </ModalHeader>
        <ModalBody>
          Your subscription will be canceled and in order to continue being able
          to use all features you will have to re-subscribe.
        </ModalBody>
        {renderModalFooter()}
      </ModalContent>
    </Modal>
  );
};

export default CancelSubscriptionModal;
