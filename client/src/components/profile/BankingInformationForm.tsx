'use client';

import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
  Radio,
  RadioGroup,
} from '@nextui-org/react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import { ADD_NEW_BANK_ACCOUNT_PAGE } from '@/lib/constants/pages';
import {
  BankingInformation,
  bankingInformationSchema,
  UserModel,
} from '@/lib/types/models/user';

const SELECTED_BANK_ID = 1;

const mockBankingInformation: Array<BankingInformation> = [
  {
    id: 1,
    name: 'Swedbank',
    code: 'HABALT22',
    accountNumber: 'LT55 7300 0100 0000 0036',
  },
  {
    id: 2,
    name: 'Luminor',
    code: 'AGBLLT2X',
    accountNumber: 'LT55 7300 0100 0000 0037',
  },
  {
    id: 3,
    name: 'Luminor',
    code: 'AGBLLT2X',
    accountNumber: 'LT55 7300 0100 0000 0037',
  },
];

const defaultValue = mockBankingInformation.find(
  (entry) => entry.id === SELECTED_BANK_ID
)?.name;

type Props = {
  user: UserModel;
};

const BankingInformationForm = ({ user }: Props) => {
  const router = useRouter();
  let bankingInformation = user.bankingInformation;
  bankingInformation = mockBankingInformation;
  // const [isAddingNew, setIsAddingNew] = useState(!bankingInformation.length);

  const { register, handleSubmit } = useForm<BankingInformation>({
    defaultValues: {},
    resolver: zodResolver(bankingInformationSchema),
  });

  const onSubmit = () => {};

  const handleAddNewBankAccount = () => {
    router.push(ADD_NEW_BANK_ACCOUNT_PAGE);
  };

  const renderBankingInformationCard = ({
    id,
    name,
    code,
    accountNumber,
  }: BankingInformation) => (
    <Card key={id} className='col-span-1'>
      <CardBody className='flex flex-row gap-2 items-center'>
        <Radio color='secondary' value={name} />
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

  // if (isAddingNew) return <AddNewBankAccountForm onCancel={handleCancel} />;

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
        <RadioGroup className='w-full' defaultValue={defaultValue}>
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
        <Button color='secondary'>Save</Button>
      </CardFooter>
    </Card>
  );
};

export default BankingInformationForm;
