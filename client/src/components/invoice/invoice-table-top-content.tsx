import { ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import {
  buttonVariants,
  Checkbox,
  CloseButton,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownPopover,
  DropdownTrigger,
  Input
} from '@heroui/react';
import { useTranslations } from 'next-intl';
import { Dispatch, SetStateAction } from 'react';

import { LIST_PAGE_SIZES } from '@/lib/constants/table';
import { capitalize } from '@/lib/utils';

import InvoiceTableFilterDropdown from './invoice-table-filter-dropdown';

type Props = {
  columns: Array<{ name: string; uid: string; sortable?: boolean }>;
  statusOptions: Array<{ name: string; uid: string }>;
  searchValue: string;
  onSearchChange: (_value: string) => void;
  overdueOnly: boolean;
  onOverdueToggle: () => void;
  statusFilter: string;
  onStatusChange: (_status: string) => void;
  lifecycleOptions: Array<{ name: string; uid: string }>;
  lifecycleFilter: string;
  onLifecycleChange: (_lifecycle: string) => void;
  visibleColumns: Set<string> | 'all';
  setVisibleColumns: Dispatch<SetStateAction<Set<string> | 'all'>>;
  rowsPerPage: number;
  onRowsPerPageChange: (_rowsPerPage: number) => void;
  total: number;
};

const InvoiceTableTopContent = ({
  columns,
  statusOptions,
  searchValue,
  onSearchChange,
  visibleColumns,
  setVisibleColumns,
  overdueOnly,
  onOverdueToggle,
  statusFilter,
  onStatusChange,
  lifecycleOptions,
  lifecycleFilter,
  onLifecycleChange,
  rowsPerPage,
  onRowsPerPageChange,
  total
}: Props) => {
  const t = useTranslations('invoices');

  const totalInvoicesText =
    total === 1
      ? t('top_content.total_singular')
      : t('top_content.total_plural', { count: total });

  return (
    <div className="flex flex-col gap-field pt-1">
      <div className="flex flex-col items-stretch justify-between gap-heading sm:flex-row sm:items-end">
        <div className="flex w-full items-center gap-actions">
          <MagnifyingGlassIcon className="h-4 w-4" />
          <Input
            className="w-full"
            variant="secondary"
            placeholder={t('top_content.search_placeholder')}
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
          />
          {searchValue && (
            <CloseButton aria-label="Clear" onPress={() => onSearchChange('')} />
          )}
        </div>
        <div className="grid w-full grid-cols-1 gap-actions sm:flex sm:w-auto sm:gap-heading">
          <InvoiceTableFilterDropdown
            label={t('table.filters.status')}
            ariaLabel={t('table.filters.a11y.status_label')}
            options={statusOptions}
            value={statusFilter}
            onChange={onStatusChange}
          />
          <InvoiceTableFilterDropdown
            label={t('table.filters.lifecycle')}
            ariaLabel={t('table.filters.a11y.lifecycle_label')}
            options={lifecycleOptions}
            value={lifecycleFilter}
            onChange={onLifecycleChange}
          />
          <Checkbox
            variant="primary"
            className={buttonVariants({
              variant: 'tertiary',
              className: 'w-full gap-actions sm:w-auto'
            })}
            isSelected={overdueOnly}
            onChange={onOverdueToggle}
          >
            <Checkbox.Content>
              <Checkbox.Control>
                <Checkbox.Indicator className="[&_svg]:h-full [&_svg]:w-full" />
              </Checkbox.Control>
              {t('table.filters.overdue_only')}
            </Checkbox.Content>
          </Checkbox>
          <Dropdown>
            <DropdownTrigger
              className={buttonVariants({
                variant: 'tertiary',
                className:
                  'flex w-full items-center justify-center gap-actions sm:w-auto'
              })}
            >
              <span>{t('table.filters.columns')}</span>
              <ChevronDownIcon className="h-4 w-4 text-sm" />
            </DropdownTrigger>
            <DropdownPopover>
              <DropdownMenu
                disallowEmptySelection
                aria-label={t('table.filters.a11y.columns_label')}
                selectedKeys={visibleColumns}
                selectionMode="multiple"
                onSelectionChange={(keys) => setVisibleColumns(keys === 'all' ? 'all' : new Set(Array.from(keys, String)))}
              >
                {columns.map((column) => (
                  <DropdownItem
                    key={column.uid}
                    id={column.uid}
                    textValue={capitalize(column.name)}
                    className="capitalize"
                  >
                    {capitalize(column.name)}
                    <Dropdown.ItemIndicator />
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </DropdownPopover>
          </Dropdown>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="section-eyebrow text-muted">{totalInvoicesText}</span>
        <label className="section-eyebrow text-muted flex items-center">
          {t('table.rows_per_page')}
          <select
            className="section-eyebrow text-muted bg-transparent outline-none"
            onChange={(event) => onRowsPerPageChange(Number(event.target.value))}
            value={rowsPerPage}
          >
            {LIST_PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
};

export default InvoiceTableTopContent;
