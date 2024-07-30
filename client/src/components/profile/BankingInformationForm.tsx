'use client';

import {
  PlusIcon,
  TrashIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
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
  useDisclosure,
} from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { updateUserSelectedBankAccount } from '@/api';
import { ADD_NEW_BANK_ACCOUNT_PAGE } from '@/lib/constants/pages';
import { UiState } from '@/lib/constants/uiState';
import useGetBankAccounts from '@/lib/hooks/banking-information/useGetBankAccounts';
import useGetUser from '@/lib/hooks/user/useGetUser';
import { BankingInformation } from '@/lib/types/models/user';

import DeleteBankAccountModal from './DeleteBankAccountModal';
import ErrorAlert from '../ui/ErrorAlert';
import Loader from '../ui/Loader';

type Props = {
  userId: number;
};

const BankingInformationForm = ({ userId }: Props) => {
  const router = useRouter();
  const { bankAccounts, bankAccountsError, isBankAccountsLoading } =
    useGetBankAccounts({ userId });
  const { user, isUserLoading, userError, mutateUser } = useGetUser({ userId });

  const { isOpen, onClose, onOpen } = useDisclosure();

  const [selectedBankAccountId, setSelectedBankAccountId] = useState(
    String(user?.selectedBankAccountId)
  );
  const [submissionMessage, setSubmissionMessage] = useState('');
  const [uiState, setUiState] = useState(UiState.Idle);

  const [bankAccountToDelete, setBankAccountToDelete] =
    useState<BankingInformation>();

  const handleAddNewBankAccount = () => {
    router.push(ADD_NEW_BANK_ACCOUNT_PAGE);
  };

  const handleSave = async () => {
    if (!user?.id || !selectedBankAccountId) return;

    setUiState(UiState.Pending);
    const response = await updateUserSelectedBankAccount(
      user.id,
      Number(selectedBankAccountId)
    );
    setSubmissionMessage(response.data.message);

    if ('errors' in response.data) {
      setUiState(UiState.Failure);

      return;
    }

    setUiState(UiState.Success);
    mutateUser();
  };

  const handleTrashIconClick = (bankAccount: BankingInformation) => {
    setBankAccountToDelete(bankAccount);
    onOpen();
  };

  if (bankAccountsError || userError) return <ErrorAlert />;

  const renderBankingInformationCard = ({
    id,
    name,
    code,
    accountNumber,
  }: BankingInformation) => (
    <Card key={id} className='col-span-1'>
      <CardBody className='flex flex-row gap-2 items-center'>
        <Radio color='secondary' value={String(id || 0)} />
        <div>
          <h4 className='font-bold text-large'>{name}</h4>
          <p className='text-tiny uppercase font-bold'>{code}</p>
          <small className='text-default-500'>{accountNumber}</small>
        </div>
        <Button
          isIconOnly
          isDisabled={id === user?.selectedBankAccountId}
          variant='light'
          color={id === user?.selectedBankAccountId ? 'default' : 'danger'}
          className='min-w-unit-8 w-unit-8 h-unit-8 cursor-pointer absolute right-4'
          startContent={
            id === user?.selectedBankAccountId ? (
              <LockClosedIcon className='w-5 h-5' />
            ) : (
              <TrashIcon
                onClick={() =>
                  handleTrashIconClick({ id, name, code, accountNumber })
                }
                className='w-5 h-5'
              />
            )
          }
        />
      </CardBody>
    </Card>
  );

  return (
    <>
      <Card className='w-full bg-transparent border border-neutral-800'>
        <CardHeader className='p-4 px-6'>Banking Information</CardHeader>
        <Divider />
        <CardBody className='p-6 flex flex-col items-end gap-6'>
          <Button
            color={'secondary'}
            endContent={<PlusIcon className='w-4 h-4' />}
            onPress={handleAddNewBankAccount}
          >
            Add New
          </Button>
          {isBankAccountsLoading || isUserLoading ? (
            <Loader />
          ) : (
            <RadioGroup
              className='w-full'
              value={String(selectedBankAccountId)}
              onValueChange={setSelectedBankAccountId}
            >
              <div className='grid grid-cols-2 gap-4'>
                {bankAccounts?.map((account) => {
                  const { id, name, code, accountNumber } = account;

                  return renderBankingInformationCard({
                    id,
                    name,
                    code,
                    accountNumber,
                  });
                })}
              </div>
            </RadioGroup>
          )}
        </CardBody>
        <CardFooter className='justify-end p-6'>
          {submissionMessage && (
            <Chip
              color={uiState === UiState.Failure ? 'danger' : 'success'}
              className='mb-4'
            >
              {submissionMessage}
            </Chip>
          )}
          <Button
            isDisabled={
              selectedBankAccountId === String(user?.selectedBankAccountId)
            }
            isLoading={uiState === UiState.Pending}
            color='secondary'
            onPress={handleSave}
          >
            Save
          </Button>
        </CardFooter>
      </Card>

      {bankAccountToDelete && isOpen && (
        <DeleteBankAccountModal
          userId={userId}
          isOpen={isOpen}
          onClose={onClose}
          bankAccount={bankAccountToDelete}
        />
      )}
    </>
  );
};

export default BankingInformationForm;
