"use client";

import {
  BuildingLibraryIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";
import {
  Button,
  Card,
  CardBody,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import { useRouter } from "next/navigation";

import { BANKING_INFORMATION_PAGE } from "@/lib/constants/pages";
import useGetBankAccounts from "@/lib/hooks/banking-information/useGetBankAccounts";
import { BankingInformationFormModel } from "@/lib/types/models/user";

type Props = {
  userId: number;
  isOpen: boolean;
  onClose: () => void;
  onBankAccountSelect: (
    bankingInformation: BankingInformationFormModel,
  ) => void;
};

const BankingInformationModal = ({
  userId,
  isOpen,
  onClose,
  onBankAccountSelect,
}: Props) => {
  const router = useRouter();
  const { bankAccounts } = useGetBankAccounts({ userId });

  const renderBody = () => {
    if (!bankAccounts?.length) {
      return (
        <p className="text-default-500">
          You have no bank accounts. Create one to get started.
        </p>
      );
    }

    return bankAccounts?.map((bankAccount) => (
      <div
        key={bankAccount.id}
        onClick={() => onBankAccountSelect(bankAccount)}
      >
        <Card isHoverable className={"justify-center cursor-pointer"}>
          <CardBody className="flex flex-row justify-between min-h-[70px] min-w-72 items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="item-center flex rounded-medium border p-2 border-default-200">
                <BuildingLibraryIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="pb-0.5 truncate uppercase text-small font-bold">
                  {bankAccount.name}
                </div>
                <div className="flex gap-2 text-xs text-default-500">
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
