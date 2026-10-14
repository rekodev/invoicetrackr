import { ChevronDownIcon } from '@heroicons/react/24/outline';
import {
  buttonVariants,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownPopover,
  DropdownTrigger
} from '@heroui/react';

type Props = {
  label: string;
  ariaLabel: string;
  options: Array<{ name: string; uid: string }>;
  value: string;
  onChange: (_value: string) => void;
};

const InvoiceTableFilterDropdown = ({
  label,
  ariaLabel,
  options,
  value,
  onChange
}: Props) => (
  <Dropdown>
    <DropdownTrigger
      className={buttonVariants({
        variant: 'tertiary',
        className: 'flex w-full items-center justify-center gap-actions sm:w-auto'
      })}
    >
      {label}
      <ChevronDownIcon className="h-4 w-4 text-sm" />
    </DropdownTrigger>
    <DropdownPopover>
      <DropdownMenu
        disallowEmptySelection
        aria-label={ariaLabel}
        selectedKeys={new Set([value])}
        selectionMode="single"
        onSelectionChange={(keys) =>
          onChange(keys === 'all' ? 'all' : String(Array.from(keys)[0] || 'all'))
        }
      >
        {options.map((option) => (
          <DropdownItem key={option.uid} id={option.uid} textValue={option.name}>
            {option.name}
            <Dropdown.ItemIndicator />
          </DropdownItem>
        ))}
      </DropdownMenu>
    </DropdownPopover>
  </Dropdown>
);

export default InvoiceTableFilterDropdown;
