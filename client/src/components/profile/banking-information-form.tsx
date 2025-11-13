'use client';

import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
  Radio,
  RadioGroup,
  addToast,
  useDisclosure
} from '@heroui/react';
import {
  LockClosedIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { useEffect, useState, useTransition } from 'react';
import { PlusCircleIcon } from '@heroicons/react/24/solid';
import { User } from 'next-auth';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { ADD_NEW_BANK_ACCOUNT_PAGE } from '@/lib/constants/pages';
import { BankAccount } from '@invoicetrackr/types';
import { isResponseError } from '@/lib/utils/error';
import { updateSessionAction } from '@/lib/actions';
import { updateUserSelectedBankAccount } from '@/api/user';

import DeleteBankAccountDialog from './delete-bank-account-dialog';
import EditBankingInformationDialog from './edit-banking-information-dialog';
import EmptyState from '../ui/empty-state';

type Props = {
  user: User;
  bankAccounts: Array<Omit<BankAccount, 'id'> & { id?: number }> | undefined;
};

const BankingInformationForm = ({ user, bankAccounts }: Props) => {
  const t = useTranslations('profile.banking_information');
  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  const { isOpen, onClose, onOpen } = useDisclosure();
  const {
    isOpen: isEditOpen,
    onClose: onEditClose,
    onOpen: onEditOpen
  } = useDisclosure();

  const [selectedBankAccountId, setSelectedBankAccountId] = useState(
    String(user.selectedBankAccountId)
  );

  const [currentBankingInformation, setCurrentBankingInformation] =
    useState<BankAccount>();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedBankAccountId(String(user.selectedBankAccountId));
  }, [user.selectedBankAccountId]);

  const handleAddNewBankAccount = () => {
    router.push(ADD_NEW_BANK_ACCOUNT_PAGE);
  };

  const handleSave = async () =>
    startTransition(async () => {
      if (!user?.id || !selectedBankAccountId) return;

      const response = await updateUserSelectedBankAccount(
        Number(user.id),
        Number(selectedBankAccountId)
      );

      addToast({
        title: response.data.message,
        color: isResponseError(response) ? 'danger' : 'success'
      });

      if (isResponseError(response)) return;

      await updateSessionAction({
        newSession: {
          selectedBankAccountId: Number(selectedBankAccountId)
        }
      });
      router.refresh();
    });

  const handleEdit = (bankAccount: BankAccount) => {
    setCurrentBankingInformation(bankAccount);
    onEditOpen();
  };

  const handleTrashIconClick = (bankAccount: BankAccount) => {
    setCurrentBankingInformation(bankAccount);
    onOpen();
  };

  const renderBankingInformationCard = ({
    id,
    name,
    code,
    accountNumber
  }: BankAccount) => (
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
          title={t('empty_state.title')}
          description={t('empty_state.description')}
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
              id: id || 0,
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
        <CardHeader className="p-4 px-6">{t('title')}</CardHeader>
        <Divider />
        <CardBody className="flex flex-col items-end gap-6 p-6">
          <Button
            color="secondary"
            variant="bordered"
            endContent={<PlusIcon className="h-4 w-4" />}
            onPress={handleAddNewBankAccount}
          >
            {t('actions.add')}
          </Button>

          {renderCardBody()}
        </CardBody>
        <CardFooter className="flex w-full items-center justify-between p-6">
          <div className="flex w-full flex-col items-center">
            <Button
              isDisabled={
                selectedBankAccountId === String(user.selectedBankAccountId)
              }
              isLoading={isPending}
              color="secondary"
              onPress={handleSave}
              className="self-end"
            >
              {t('actions.save')}
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
