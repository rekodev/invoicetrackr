'use client';

import {
  BuildingLibraryIcon,
  PlusCircleIcon
} from '@heroicons/react/24/outline';
import {
  Button,
  Card,
  CardBody,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader
} from '@heroui/react';
import { useRouter } from 'next/navigation';

import { BANKING_INFORMATION_PAGE } from '@/lib/constants/pages';
import { BankingInformationFormModel } from '@/lib/types/models/user';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onBankAccountSelect: (
    bankingInformation: BankingInformationFormModel
  ) => void;
  bankingInformation?: Array<BankingInformationFormModel>;
};

const BankingInformationModal = ({
  isOpen,
  onClose,
  onBankAccountSelect,
  bankingInformation
}: Props) => {
  const router = useRouter();

  const renderBody = () => {
    if (!bankingInformation?.length) {
      return (
        <p className="text-default-500">
          You have no bank accounts. Create one to get started.
        </p>
      );
    }

    return bankingInformation?.map((bankAccount) => (
      <div
        key={bankAccount.id}
        onClick={() => onBankAccountSelect(bankAccount)}
      >
        <Card isHoverable className={'cursor-pointer justify-center'}>
          <CardBody className="flex min-h-[70px] min-w-72 flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="item-center rounded-medium border-default-200 flex border p-2">
                <BuildingLibraryIcon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-small truncate pb-0.5 font-bold uppercase">
                  {bankAccount.name}
                </div>
                <div className="text-default-500 flex gap-2 text-xs">
                  <span>{bankAccount.code}</span>
                  <span>{bankAccount.accountNumber}</span>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    ));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>Select Bank Account</ModalHeader>
        <ModalBody>{renderBody()}</ModalBody>
        <ModalFooter>
          <Button
            color="secondary"
            onPress={() => router.push(BANKING_INFORMATION_PAGE)}
            startContent={<PlusCircleIcon className="h-5 w-5" />}
          >
            Add New
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default BankingInformationModal;
