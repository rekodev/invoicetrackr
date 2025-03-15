import {
  Button,
  Chip,
  Input,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
} from "@heroui/react";
import { Key, useEffect, useMemo } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";

import { InvoiceFormData, InvoiceService } from "@/lib/types/models/invoice";
import { getCurrencySymbol } from "@/lib/utils/currency";

import DeleteIcon from "../icons/DeleteIcon";
import { PlusIcon } from "../icons/PlusIcon";

const INVOICE_SERVICE_COLUMNS = [
  { name: "#", uid: "no" },
  { name: "DESCRIPTION", uid: "description" },
  { name: "UNIT", uid: "unit" },
  { name: "QUANTITY", uid: "quantity" },
  { name: "AMOUNT", uid: "amount" },
  { name: "ACTION", uid: "actions" },
];
const INITIAL_GRAND_TOTAL = 0;

type Props = {
  invoiceServices?: Array<InvoiceService>;
  isInvalid?: boolean;
  errorMessage?: string;
  currency: string;
};

const InvoiceServicesTable = ({
  invoiceServices,
  isInvalid,
  errorMessage,
  currency,
}: Props) => {
  const {
    register,
    control,
    watch,
    clearErrors,
    formState: { errors },
  } = useFormContext<InvoiceFormData>();
  const { fields, append, remove, replace } = useFieldArray({
    name: "services",
    control,
  });

  // watching the entire services array doesn't work, individual services have to be selected
  const serviceAmounts = fields.map(
    (_field, index) =>
      watch(`services.${index}.amount`) * watch(`services.${index}.quantity`),
  );

  const totalAmount = useMemo(
    () =>
      serviceAmounts.reduce(
        (acc, amount) => acc + (Number(amount) || 0),
        INITIAL_GRAND_TOTAL,
      ),
    [serviceAmounts],
  );

  useEffect(() => {
    if (!invoiceServices?.length) return;

    replace(invoiceServices);
  }, [invoiceServices, replace]);

  const handleAddService = () => {
    append({ amount: 0, description: "", quantity: 0, unit: "" });

    // Clear errors if there are no services
    if (!serviceAmounts.length) clearErrors("services");
  };

  const handleRemoveService = (index: number) => {
    remove(index);
  };

  const renderBottomContent = () => (
    <div className="flex justify-between items-center">
      <Button variant="bordered" color="secondary" onPress={handleAddService}>
        <PlusIcon height={2} width={2} />
        Add Service
      </Button>
      <div className="flex gap-6 pr-3">
        <p>Grand Total:</p>
        <p>
          {getCurrencySymbol(currency)}
          {totalAmount >= 0.01 ? totalAmount.toFixed(2) : 0}
        </p>
      </div>
    </div>
  );

  const renderCell = (columnKey: Key, index: number) => {
    switch (columnKey as (typeof INVOICE_SERVICE_COLUMNS)[number]["uid"]) {
      case "no":
        return <div aria-label="Number">{index + 1}</div>;
      case "description":
        return (
          <Input
            aria-label="Description"
            type="text"
            maxLength={200}
            defaultValue={fields[index].description || ""}
            variant="bordered"
            {...register(`services.${index}.description`)}
            isInvalid={!!errors.services?.[index]?.description}
            errorMessage={errors.services?.[index]?.description?.message}
          />
        );
      case "unit":
        return (
          <Input
            aria-label="Unit"
            type="text"
            maxLength={20}
            defaultValue={fields[index].unit || ""}
            variant="bordered"
            {...register(`services.${index}.unit`)}
            isInvalid={!!errors.services?.[index]?.unit}
            errorMessage={errors.services?.[index]?.unit?.message}
          />
        );
      case "quantity":
        return (
          <Input
            aria-label="Quantity"
            type="number"
            defaultValue={fields[index].quantity?.toString() || ""}
            variant="bordered"
            {...register(`services.${index}.quantity`)}
            isInvalid={!!errors.services?.[index]?.quantity}
            errorMessage={errors.services?.[index]?.quantity?.message}
          />
        );
      case "amount":
        return (
          <Input
            aria-label="Amount"
            type="number"
            defaultValue={fields[index].amount?.toString() || ""}
            variant="bordered"
            {...register(`services.${index}.amount`)}
            isInvalid={!!errors.services?.[index]?.amount}
            errorMessage={errors.services?.[index]?.amount?.message}
          />
        );
      case "actions":
        return (
          <div
            aria-label="Actions"
            className="relative flex items-center gap-2"
          >
            <Tooltip disableAnimation color="danger" content="Delete service">
              <Button
                onPress={() => handleRemoveService(index)}
                variant="light"
                className="text-lg text-danger cursor-pointer active:opacity-50 min-w-min p-3"
              >
                <DeleteIcon />
              </Button>
            </Tooltip>
          </div>
        );
      default:
        return;
    }
  };

  return (
    <>
      <Table
        aria-label="Invoice Services Table"
        bottomContent={renderBottomContent()}
      >
        <TableHeader columns={INVOICE_SERVICE_COLUMNS}>
          {(column) => (
            <TableColumn key={column.uid}>{column.name}</TableColumn>
          )}
        </TableHeader>
        <TableBody items={fields} className="bg-red-500">
          {fields.map((field) => (
            <TableRow key={field.id}>
              {(columnKey) => (
                <TableCell>
                  {renderCell(columnKey, fields.indexOf(field))}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {isInvalid && (
        <Chip
          className="mt-[-0.75rem]"
          size="sm"
          variant="light"
          color="danger"
        >
          {errorMessage}
        </Chip>
      )}
    </>
  );
};

export default InvoiceServicesTable;
