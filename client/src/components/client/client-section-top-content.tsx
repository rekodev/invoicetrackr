'use client';

import { ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import {
  buttonVariants,
  CloseButton,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownPopover,
  DropdownTrigger,
  Input} from '@heroui/react';
import type { InvoicePartyBusinessType } from '@invoicetrackr/types';
import { useTranslations } from 'next-intl';

import { CLIENT_BUSINESS_TYPES } from '@/lib/constants/client';

type Props = {
  total: number;
  searchTerm: string;
  onSearch: (_value: string) => void;
  typeFilters: Set<InvoicePartyBusinessType>;
  onTypeFiltersChange: (_types: Set<InvoicePartyBusinessType>) => void;
};

const ClientSectionTopContent = ({
  total,
  searchTerm,
  onSearch,
  typeFilters,
  onTypeFiltersChange
}: Props) => {
  const t = useTranslations('clients.top_content');
  const tTypes = useTranslations('clients.form_dialog.business_types');

  const totalClientsText =
    total === 1 ? t('total_singular') : t('total_plural', { count: total });

  const renderTypeFilterSelect = () => (
    <Dropdown>
      <DropdownTrigger
        className={buttonVariants({
          variant: 'tertiary',
          className: 'flex w-full shrink-0 items-center justify-center sm:w-auto'
        })}
      >
        <span>{t('type_filter')}</span>
        <ChevronDownIcon className="min-w-4 max-w-4 text-sm" />
      </DropdownTrigger>
      <DropdownPopover>
        <DropdownMenu
          disallowEmptySelection
          aria-label={t('a11y.columns_label')}
          selectionMode="multiple"
          selectedKeys={typeFilters}
          onSelectionChange={(keys) =>
            onTypeFiltersChange(
              keys === 'all'
                ? new Set(CLIENT_BUSINESS_TYPES)
                : new Set(keys as Set<InvoicePartyBusinessType>)
            )
          }
        >
          {CLIENT_BUSINESS_TYPES.map((filter) => (
            <DropdownItem
              key={filter}
              id={filter}
              textValue={tTypes(filter)}
              className="capitalize"
            >
              {tTypes(filter)}
            </DropdownItem>
          ))}
        </DropdownMenu>
      </DropdownPopover>
    </Dropdown>
  );

  return (
    <div className="flex flex-col gap-field">
      <div className="flex flex-col items-stretch justify-between gap-heading sm:flex-row sm:items-end">
        <div className="flex w-full items-center gap-actions">
          <MagnifyingGlassIcon className="h-4 w-4" />
          <Input
            variant="secondary"
            className="w-full"
            placeholder={t('search_placeholder')}
            value={searchTerm}
            onChange={(event) => onSearch(event.target.value)}
          />
          {searchTerm && (
            <CloseButton aria-label="Clear" onPress={() => onSearch('')} />
          )}
        </div>
        {renderTypeFilterSelect()}
      </div>
      <span className="section-eyebrow text-muted">{totalClientsText}</span>
    </div>
  );
};

export default ClientSectionTopContent;
