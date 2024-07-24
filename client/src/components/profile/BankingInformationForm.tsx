'use client';

import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
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
} from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { updateUserSelectedBankAccount } from '@/api';
import { ADD_NEW_BANK_ACCOUNT_PAGE } from '@/lib/constants/pages';
import { UiState } from '@/lib/constants/uiState';
import { BankingInformation, UserModel } from '@/lib/types/models/user';

type Props = {
  user: UserModel;
  bankingInformation: Array<BankingInformation>;
};

const BankingInformationForm = ({ user, bankingInformation }: Props) => {
  const router = useRouter();

  const [selectedBankAccountId, setSelectedBankAccountId] = useState(
    String(user.selectedBankAccountId)
  );
  const [submissionMessage, setSubmissionMessage] = useState('');
  const [uiState, setUiState] = useState(UiState.Idle);

  const handleAddNewBankAccount = () => {
    router.push(ADD_NEW_BANK_ACCOUNT_PAGE);
  };

  const handleSave = async () => {
    if (!user.id || !selectedBankAccountId) return;

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
  };

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
          variant='light'
          color='danger'
          className='min-w-unit-8 w-unit-8 h-unit-8 cursor-pointer absolute right-4'
          startContent={<TrashIcon className='w-5 h-5' />}
        />
      </CardBody>
    </Card>
  );

  return (
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
        <RadioGroup
          className='w-full'
          value={String(selectedBankAccountId)}
          onValueChange={setSelectedBankAccountId}
        >
          <div className='grid grid-cols-2 gap-4'>
            {bankingInformation.map((entry) => {
              const { id, name, code, accountNumber } = entry;

              return renderBankingInformationCard({
                id,
                name,
                code,
                accountNumber,
              });
            })}
          </div>
        </RadioGroup>
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
        <Button color='secondary' onPress={handleSave}>
          Save
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BankingInformationForm;
