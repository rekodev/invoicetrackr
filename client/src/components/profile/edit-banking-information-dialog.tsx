import {
  Button,
  Chip,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader
} from '@heroui/react';
import { ChangeEvent, useState } from 'react';

import { updateBankingInformationAction } from '@/lib/actions/banking-information';
import { UiState } from '@/lib/constants/ui-state';
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
  const [submissionMessage, setSubmissionMessage] = useState('');
  const [uiState, setUiState] = useState(UiState.Idle);
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

  const handleSubmit = async () => {
    setUiState(UiState.Pending);
    setSubmissionMessage('');

    const response = await updateBankingInformationAction(
      userId,
      newBankingInformation
    );
    if (response.message) setSubmissionMessage(response.message);

    if (!response.ok) {
      setUiState(UiState.Failure);

      return;
    }

    setUiState(UiState.Success);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>Edit Banking Information</ModalHeader>
        <ModalBody>
          <Input
            value={newBankingInformation.name}
            onChange={(event) => handleChange(event, 'name')}
            type="text"
            label="Name"
            variant="bordered"
          />
          <Input
            value={newBankingInformation.code}
            onChange={(event) => handleChange(event, 'code')}
            type="text"
            label="Code"
            variant="bordered"
          />
          <Input
            value={newBankingInformation.accountNumber}
            onChange={(event) => handleChange(event, 'accountNumber')}
            type="text"
            label="Account Number"
            variant="bordered"
          />
        </ModalBody>
        <ModalFooter>
          <div className="flex w-full flex-col items-start justify-between gap-5 overflow-x-hidden">
            {submissionMessage && (
              <Chip color={uiState === UiState.Success ? 'success' : 'danger'}>
                {submissionMessage}
              </Chip>
            )}
            <div className="flex w-full justify-end gap-1">
              <Button color="danger" variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button
                isLoading={uiState === UiState.Pending}
                color="secondary"
                onPress={handleSubmit}
              >
                Save
              </Button>
            </div>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditBankingInformationDialog;
