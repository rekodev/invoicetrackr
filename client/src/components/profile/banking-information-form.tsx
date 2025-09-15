'use client';

import {
  LockClosedIcon,
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

import { updateSession } from '@/lib/actions';
import { updateUserSelectedBankAccountAction } from '@/lib/actions/banking-information';
import { ADD_NEW_BANK_ACCOUNT_PAGE } from '@/lib/constants/pages';
import { UiState } from '@/lib/constants/ui-state';
import { BankingInformationFormModel } from '@/lib/types/models/user';

import DeleteBankAccountModal from './delete-bank-account-modal';
import EmptyState from '../ui/empty-state';

type Props = {
  user: User;
  userSelectedBankAccountId?: number;
  bankAccounts: Array<BankingInformationFormModel> | undefined;
};

const BankingInformationForm = ({
  user,
  bankAccounts,
  userSelectedBankAccountId
}: Props) => {
  const router = useRouter();

  const { isOpen, onClose, onOpen } = useDisclosure();

  const [selectedBankAccountId, setSelectedBankAccountId] = useState(
    String(userSelectedBankAccountId)
  );
  const [submissionMessage, setSubmissionMessage] = useState('');
  const [uiState, setUiState] = useState(UiState.Idle);

  const [bankAccountToDelete, setBankAccountToDelete] =
    useState<BankingInformationFormModel>();

  useEffect(() => {
    setSelectedBankAccountId(String(userSelectedBankAccountId));
  }, [userSelectedBankAccountId]);

  const handleAddNewBankAccount = () => {
    router.push(ADD_NEW_BANK_ACCOUNT_PAGE);
  };

  const handleSave = async () => {
    if (!user?.id || !selectedBankAccountId) return;

    setUiState(UiState.Pending);
    const response = await updateUserSelectedBankAccountAction(
      Number(user.id),
      Number(selectedBankAccountId)
    );

    if (response.message) setSubmissionMessage(response.message);

    if (!response.ok) {
      setUiState(UiState.Failure);

      return;
    }

    updateSession({
      newSession: {
        ...user,
        selectedBankAccountId: Number(selectedBankAccountId)
      }
    });
    setUiState(UiState.Success);
  };

  const handleTrashIconClick = (bankAccount: BankingInformationFormModel) => {
    setBankAccountToDelete(bankAccount);
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
        <Button
          isIconOnly
          isDisabled={id === userSelectedBankAccountId}
          variant="light"
          color={id === userSelectedBankAccountId ? 'default' : 'danger'}
          className="min-w-unit-8 w-unit-8 h-unit-8 absolute right-4 cursor-pointer"
          startContent={
            id === userSelectedBankAccountId ? (
              <LockClosedIcon className="h-5 w-5" />
            ) : (
              <TrashIcon
                onClick={() =>
                  handleTrashIconClick({ id, name, code, accountNumber })
                }
                className="h-5 w-5"
              />
            )
          }
        />
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
        <CardFooter className="justify-end p-6">
          {submissionMessage && (
            <Chip
              color={uiState === UiState.Failure ? 'danger' : 'success'}
              className="mb-4"
            >
              {submissionMessage}
            </Chip>
          )}
          <Button
            isDisabled={
              selectedBankAccountId === String(userSelectedBankAccountId)
            }
            isLoading={uiState === UiState.Pending}
            color="secondary"
            onPress={handleSave}
          >
            Save
          </Button>
        </CardFooter>
      </Card>

      {bankAccountToDelete && isOpen && (
        <DeleteBankAccountModal
          user={user}
          isOpen={isOpen}
          onClose={onClose}
          bankAccount={bankAccountToDelete}
        />
      )}
    </>
  );
};

export default BankingInformationForm;
