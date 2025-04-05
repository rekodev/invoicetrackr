"use client";

import { UserIcon } from "@heroicons/react/24/outline";
import { Card, CardBody } from "@heroui/react";

import { ClientModel } from "@/lib/types/models/client";
import { cn } from "@/lib/utils/cn";
import { getCurrencySymbol } from "@/lib/utils/currency";

type Props = {
  currency?: string;
  client: Partial<ClientModel>;
  onClick?: () => void;
  amount?: number;
  hideIcon?: boolean;
  truncate?: boolean;
};

const ClientCard = ({
  truncate,
  currency,
  client,
  onClick,
  amount,
  hideIcon,
}: Props) => {
  return (
    <div onClick={onClick}>
      <Card
        isHoverable={!!onClick}
        className={cn("justify-center", {
          "cursor-pointer": !!onClick,
        })}
      >
        <CardBody className="flex flex-row justify-between min-h-[70px] min-w-72 items-center gap-4">
          <div className="flex items-center gap-3">
            {!hideIcon && (
              <div className="item-center flex rounded-medium border p-2 border-default-200">
                <UserIcon className="w-5 h-5" />
              </div>
            )}
            <div>
              <div
                className={cn(
                  "pb-0.5 truncate uppercase text-small font-bold",
                  { "lg:truncate lg:max-w-40": truncate },
                )}
              >
                {client.name}
              </div>
              <div className="flex gap-2 text-xs text-default-500">
                {client.address && <span>{client.address}</span>}
                <span className={cn("", { "max-w-40 truncate": truncate })}>
                  {client.email}
                </span>
              </div>
            </div>
          </div>
          {amount && currency && (
            <div className="text-lg font-medium right-3 flex gap-[1px]">
              <span className="text-success-700">
                {getCurrencySymbol(currency)}
              </span>
              {Number(amount).toFixed(2)}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default ClientCard;
