import {
  Button,
  Chip,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { ChangeEvent, useState } from "react";

import { addClient } from "@/api";
import { CLIENT_BUSINESS_TYPES } from "@/lib/constants/client";
import { UiState } from "@/lib/constants/uiState";
import useGetClients from "@/lib/hooks/client/useGetClients";
import useGetUser from "@/lib/hooks/user/useGetUser";
import { ClientFormData, ClientModel } from "@/lib/types/models/client";
import { capitalize } from "@/lib/utils";
import { mapValidationErrors } from "@/lib/utils/validation";

const INITIAL_CLIENT_DATA: ClientFormData = {
  name: "",
  type: "receiver",
  businessType: null,
  businessNumber: "",
  address: "",
  email: "",
};

type Props = {
  userId: number;
  isOpen: boolean;
  onClose: () => void;
};

const AddNewClientModal = ({ userId, isOpen, onClose }: Props) => {
  const { user } = useGetUser({ userId });
  const { mutateClients } = useGetClients({ userId });

  const [clientData, setClientData] =
    useState<ClientFormData>(INITIAL_CLIENT_DATA);
  const [uiState, setUiState] = useState(UiState.Idle);
  const [submissionMessage, setSubmissionMessage] = useState("");
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    field: keyof Omit<ClientModel, "id" | "type">,
  ) => {
    setClientData((prev) => ({ ...prev, [field]: event.target.value }));

    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const { [field]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleSubmit = async () => {
    if (!user?.id) return;

    setUiState(UiState.Pending);

    const result = await addClient(user.id, clientData);
    setSubmissionMessage(result.data.message);

    if ("errors" in result.data) {
      setUiState(UiState.Failure);

      const validationErrors = mapValidationErrors(
        result.data.errors as Record<string, string>[],
      );

      setValidationErrors(validationErrors);

      return;
    }

    setUiState(UiState.Success);
    mutateClients();
  };

  const handleCloseAndClear = () => {
    onClose();
    setSubmissionMessage("");
    setValidationErrors({});
    setClientData(INITIAL_CLIENT_DATA);
  };

  const renderModalFooter = () => (
    <ModalFooter>
      <div className="flex flex-col w-full items-start gap-5 justify-between overflow-x-hidden">
        {submissionMessage && (
          <Chip color={uiState === UiState.Success ? "success" : "danger"}>
            {submissionMessage}
          </Chip>
        )}
        <div className="flex gap-1 justify-end w-full">
          <Button color="danger" variant="light" onPress={handleCloseAndClear}>
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
  );

  return (
    <Modal isOpen={isOpen} onClose={handleCloseAndClear}>
      <ModalContent>
        <ModalHeader>Add New Client</ModalHeader>
        <ModalBody>
          <Input
            value={clientData.name}
            onChange={(event) => handleChange(event, "name")}
            type="text"
            label="Name"
            variant="bordered"
            isInvalid={!!validationErrors["name"]}
            errorMessage={validationErrors["name"]}
          />
          <Select
            value=""
            onChange={(event) => handleChange(event, "businessType")}
            label="Business Type"
            variant="bordered"
            isInvalid={!!validationErrors["businessType"]}
            errorMessage={validationErrors["businessType"]}
          >
            {CLIENT_BUSINESS_TYPES.map((type) => (
              <SelectItem key={type}>{capitalize(type)}</SelectItem>
            ))}
          </Select>
          <Input
            value={clientData.businessNumber}
            onChange={(event) => handleChange(event, "businessNumber")}
            type="text"
            label="Business Number"
            variant="bordered"
            isInvalid={!!validationErrors["businessNumber"]}
            errorMessage={validationErrors["businessNumber"]}
          />
          <Input
            value={clientData.address}
            onChange={(event) => handleChange(event, "address")}
            type="text"
            label="Address"
            variant="bordered"
            isInvalid={!!validationErrors["address"]}
            errorMessage={validationErrors["address"]}
          />
          <Input
            value={clientData.email}
            onChange={(event) => handleChange(event, "email")}
            type="email"
            label="Email"
            variant="bordered"
            isInvalid={!!validationErrors["email"]}
            errorMessage={validationErrors["email"]}
          />
        </ModalBody>
        {renderModalFooter()}
      </ModalContent>
    </Modal>
  );
};

export default AddNewClientModal;
