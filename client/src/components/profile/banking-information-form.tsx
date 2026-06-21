'use client';

import {
  Button,
  Card,
  CardContent,
  CardFooter,
  Label,
  Radio,
  RadioGroup,
  Separator,
  cn,
  toast,
  useOverlayState
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
  const { isOpen, close: onClose, open: onOpen } = useOverlayState();
  const {
    isOpen: isEditOpen,
    close: onEditClose,
    open: onEditOpen
  } = useOverlayState();

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

      toast(response.data.message, {
        variant: isResponseError(response) ? 'danger' : 'success'
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
  }: BankAccount) => {
    const isSelected = selectedBankAccountId === String(id || 0);

    return (
      <Card
        key={id}
        className={cn('group col-span-2 border pt-0 lg:col-span-1', {
          'border-accent border-2': isSelected
        })}
      >
        <CardContent className="flex flex-row items-center gap-2 pr-24">
          <Radio value={String(id || 0)} className="min-w-0">
            <Radio.Control>
              <Radio.Indicator />
            </Radio.Control>
            <Radio.Content>
              <Label className="text-large font-semibold">{name}</Label>
              <p className="text-xs font-bold uppercase">{code}</p>
              <small className="text-default-500 mt-1">{accountNumber}</small>
            </Radio.Content>
          </Radio>
          <div className="pointer-events-none absolute right-2 top-2 flex gap-0.5 opacity-0 transition group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:opacity-100">
            <Button
              isIconOnly
              size="sm"
              variant="tertiary"
              onPress={() => handleEdit({ id, name, code, accountNumber })}
            >
              <PencilSquareIcon className="h-4 w-4" />
            </Button>
            <Button
              isIconOnly
              size="sm"
              isDisabled={id === user.selectedBankAccountId}
              variant={
                id === user.selectedBankAccountId ? 'tertiary' : 'danger-soft'
              }
              className="min-w-unit-8 w-unit-8 h-unit-8 cursor-pointer"
              onPress={() => {
                if (id === user.selectedBankAccountId) return;

                handleTrashIconClick({ id, name, code, accountNumber });
              }}
            >
              {id === user.selectedBankAccountId ? (
                <LockClosedIcon className="h-4 w-4" />
              ) : (
                <TrashIcon className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

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
        variant="secondary"
        value={String(selectedBankAccountId)}
        onChange={setSelectedBankAccountId}
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
      <Card className="w-full border bg-transparent">
        <Card.Header className="flex flex-row items-center justify-between gap-4 p-2 px-6">
          <Card.Title className="text-2xl">{t('title')}</Card.Title>
          <Button variant="secondary" onPress={handleAddNewBankAccount}>
            <PlusIcon className="h-4 w-4" />
            {t('actions.add')}
          </Button>
        </Card.Header>
        <Separator />
        <CardContent className="p-6">{renderCardBody()}</CardContent>
        <CardFooter className="flex w-full items-center justify-between p-6">
          <div className="flex w-full flex-col items-center">
            <Button
              isDisabled={
                selectedBankAccountId === String(user.selectedBankAccountId)
              }
              onPress={handleSave}
              isPending={isPending}
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
