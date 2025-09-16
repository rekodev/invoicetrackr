'use client';

import {
  LockClosedIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { PlusCircleIcon } from '@heroicons/react/24/solid';
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Chip,
  Divider,
  Radio,
  RadioGroup,
  useDisclosure
} from '@heroui/react';
import { useRouter } from 'next/navigation';
import { User } from 'next-auth';
import { useEffect, useState } from 'react';

import { updateUserSelectedBankAccount } from '@/api';
import { updateSession } from '@/lib/actions';
import { ADD_NEW_BANK_ACCOUNT_PAGE } from '@/lib/constants/pages';
import { UiState } from '@/lib/constants/ui-state';
import { BankingInformationFormModel } from '@/lib/types/models/user';
import { isResponseError } from '@/lib/utils/error';

import DeleteBankAccountDialog from './delete-bank-account-dialog';
import EditBankingInformationDialog from './edit-banking-information-dialog';
import EmptyState from '../ui/empty-state';

type Props = {
  user: User;
  bankAccounts: Array<BankingInformationFormModel> | undefined;
};

const BankingInformationForm = ({ user, bankAccounts }: Props) => {
  const router = useRouter();

  const { isOpen, onClose, onOpen } = useDisclosure();
  const {
    isOpen: isEditOpen,
    onClose: onEditClose,
    onOpen: onEditOpen
  } = useDisclosure();

  const [selectedBankAccountId, setSelectedBankAccountId] = useState(
    String(user.selectedBankAccountId)
  );
  const [submissionMessage, setSubmissionMessage] = useState('');
  const [uiState, setUiState] = useState(UiState.Idle);

  const [currentBankingInformation, setCurrentBankingInformation] =
    useState<BankingInformationFormModel>();

  useEffect(() => {
    setSelectedBankAccountId(String(user.selectedBankAccountId));
  }, [user.selectedBankAccountId]);

  const handleAddNewBankAccount = () => {
    router.push(ADD_NEW_BANK_ACCOUNT_PAGE);
  };

  const handleSave = async () => {
    if (!user?.id || !selectedBankAccountId) return;

    setUiState(UiState.Pending);
    const response = await updateUserSelectedBankAccount(
      Number(user.id),
      Number(selectedBankAccountId)
    );

    if (response.data.message) setSubmissionMessage(response.data.message);

    if (isResponseError(response)) {
      setUiState(UiState.Failure);

      return;
    }

    await updateSession({
      newSession: {
        ...user,
        selectedBankAccountId: Number(selectedBankAccountId)
      }
    });
    setUiState(UiState.Success);
    router.refresh();
  };

  const handleEdit = (bankAccount: BankingInformationFormModel) => {
    setCurrentBankingInformation(bankAccount);
    onEditOpen();
  };

  const handleTrashIconClick = (bankAccount: BankingInformationFormModel) => {
    setCurrentBankingInformation(bankAccount);
    onOpen();
  };

  const renderAddNewButton = () => (
    <Button
      color="secondary"
      variant="bordered"
      endContent={<PlusIcon className="h-4 w-4" />}
      onPress={handleAddNewBankAccount}
    >
      Add New
    </Button>
  );

  const renderBankingInformationCard = ({
    id,
    name,
    code,
    accountNumber
  }: BankingInformationFormModel) => (
    <Card key={id} className="col-span-2 lg:col-span-1">
      <CardBody className="flex flex-row items-center gap-2">
        <Radio color="secondary" value={String(id || 0)} />
        <div>
          <h4 className="text-large font-bold">{name}</h4>
          <p className="text-tiny font-bold uppercase">{code}</p>
          <small className="text-default-500">{accountNumber}</small>
        </div>
        <div className="absolute right-4 flex gap-0.5">
          <Button
            isIconOnly
            variant="light"
            color="default"
            startContent={<PencilSquareIcon className="h-5 w-5" />}
            onPress={() => handleEdit({ id, name, code, accountNumber })}
          />
          <Button
            isIconOnly
            isDisabled={id === user.selectedBankAccountId}
            variant="light"
            color={id === user.selectedBankAccountId ? 'default' : 'danger'}
            className="min-w-unit-8 w-unit-8 h-unit-8 cursor-pointer"
            onPress={() => {
              if (id === user.selectedBankAccountId) return;

              handleTrashIconClick({ id, name, code, accountNumber });
            }}
            startContent={
              id === user.selectedBankAccountId ? (
                <LockClosedIcon className="h-5 w-5" />
              ) : (
                <TrashIcon className="h-5 w-5" />
              )
            }
          />
        </div>
      </CardBody>
    </Card>
  );

  const renderCardBody = () => {
    if (bankAccounts?.length === 0)
      return (
        <EmptyState
          icon={<PlusCircleIcon className="text-secondary-500 h-10 w-10" />}
          title="No bank accounts"
          description='You have no bank accounts added. To add one, click on the "Add New +" button'
        />
      );

    return (
      <RadioGroup
        className="w-full"
        value={String(selectedBankAccountId)}
        onValueChange={setSelectedBankAccountId}
      >
        <div className="grid grid-cols-2 gap-4">
          {bankAccounts?.map((account) => {
            const { id, name, code, accountNumber } = account;

            return renderBankingInformationCard({
              id,
              name,
              code,
              accountNumber
            });
          })}
        </div>
      </RadioGroup>
    );
  };

  return (
    <>
      <Card className="dark:border-default-100 w-full bg-transparent dark:border">
        <CardHeader className="p-4 px-6">Banking Information</CardHeader>
        <Divider />
        <CardBody className="flex flex-col items-end gap-6 p-6">
          {renderAddNewButton()}
          {renderCardBody()}
        </CardBody>
        <CardFooter className="flex w-full items-center justify-between p-6">
          {submissionMessage && (
            <Chip color={uiState === UiState.Failure ? 'danger' : 'success'}>
              {submissionMessage}
            </Chip>
          )}
          <div className="flex w-full flex-col items-center">
            <Button
              isDisabled={
                selectedBankAccountId === String(user.selectedBankAccountId)
              }
              isLoading={uiState === UiState.Pending}
              color="secondary"
              onPress={handleSave}
              className="self-end"
            >
              Save
            </Button>
          </div>
        </CardFooter>
      </Card>

      {currentBankingInformation && isOpen && (
        <DeleteBankAccountDialog
          userId={Number(user.id)}
          isOpen={isOpen}
          onClose={onClose}
          bankingInformation={currentBankingInformation}
        />
      )}
      {currentBankingInformation && isEditOpen && (
        <EditBankingInformationDialog
          userId={Number(user.id)}
          isOpen={isEditOpen}
          onClose={onEditClose}
          bankingInformation={currentBankingInformation}
        />
      )}
    </>
  );
};

export default BankingInformationForm;
