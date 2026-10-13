import { ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import {
  Button,
  buttonVariants,
  CloseButton,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownPopover,
  DropdownTrigger,
  Input
} from '@heroui/react';
import { useTranslations } from 'next-intl';
import { ChangeEvent, Dispatch, SetStateAction, useCallback } from 'react';

import { capitalize } from '@/lib/utils';

type Props = {
  columns: Array<{ name: string; uid: string; sortable?: boolean }>;
  statusOptions: Array<{ name: string; uid: string }>;
  filterValue: string;
  setFilterValue: Dispatch<SetStateAction<string>>;
  overdueOnly: boolean;
  setOverdueOnly: Dispatch<SetStateAction<boolean>>;
  statusFilter: string;
  setStatusFilter: Dispatch<SetStateAction<string>>;
  visibleColumns: Set<string> | 'all';
  setVisibleColumns: Dispatch<SetStateAction<Set<string> | 'all'>>;
  setPage: Dispatch<SetStateAction<number>>;
  setRowsPerPage: Dispatch<SetStateAction<number>>;
  invoicesLength: number | undefined;
};

const InvoiceTableTopContent = ({
  columns,
  statusOptions,
  filterValue,
  setFilterValue,
  visibleColumns,
  setVisibleColumns,
  overdueOnly,
  setOverdueOnly,
  statusFilter,
  setStatusFilter,
  setPage,
  setRowsPerPage,
  invoicesLength
}: Props) => {
  const t = useTranslations('invoices');

  const totalInvoicesText = invoicesLength
    ? invoicesLength === 1
      ? t('top_content.total_singular')
      : t('top_content.total_plural', { count: invoicesLength })
    : t('top_content.total_plural', { count: 0 });

  const onSearchChange = useCallback(
    (value: string) => {
      if (value) {
        setFilterValue(value);
        setPage(1);
      } else {
        setFilterValue('');
      }
    },
    [setPage, setFilterValue]
  );

  const onClear = useCallback(() => {
    setFilterValue('');
    setPage(1);
  }, [setPage, setFilterValue]);

  const onRowsPerPageChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      setRowsPerPage(Number(event.target.value));
      setPage(1);
    },
    [setPage, setRowsPerPage]
  );

  return (
    <div className="flex flex-col gap-field pt-1">
      <div className="flex flex-col items-stretch justify-between gap-heading sm:flex-row sm:items-end">
        <div className="flex w-full items-center gap-actions">
          <MagnifyingGlassIcon className="h-4 w-4" />
          <Input
            className="w-full"
            variant="secondary"
            placeholder={t('top_content.search_placeholder')}
            value={filterValue}
            onChange={(event) => onSearchChange(event.target.value)}
          />
          {filterValue && <CloseButton aria-label="Clear" onPress={onClear} />}
        </div>
        <div className="grid w-full grid-cols-1 gap-actions sm:flex sm:w-auto sm:gap-heading">
          <Dropdown>
            <DropdownTrigger
              className={buttonVariants({
                variant: 'tertiary',
                className:
                  'flex w-full items-center justify-center gap-actions sm:w-auto'
              })}
            >
              {t('table.filters.status')}
              <ChevronDownIcon className="h-4 w-4 text-sm" />
            </DropdownTrigger>
            <DropdownPopover>
              <DropdownMenu
                disallowEmptySelection
                aria-label={t('table.filters.a11y.status_label')}
                selectedKeys={new Set([statusFilter])}
                selectionMode="single"
                onSelectionChange={(keys) => {
                  setStatusFilter(keys === 'all' ? 'all' : String(Array.from(keys)[0] || 'all'));
                  setPage(1);
                }}
              >
                {statusOptions.map((status) => (
                  <DropdownItem
                    key={status.uid}
                    id={status.uid}
                    textValue={capitalize(status.name)}
                    className="capitalize"
                  >
                    {capitalize(status.name)}
                    <Dropdown.ItemIndicator />
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </DropdownPopover>
          </Dropdown>
          <Button variant={overdueOnly ? 'secondary' : 'tertiary'} aria-pressed={overdueOnly}
            onPress={() => { setOverdueOnly((value) => !value); setPage(1); }}>
            {t('table.filters.overdue_only')}
          </Button>
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
            onChange={onRowsPerPageChange}
            defaultValue={10}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="15">15</option>
          </select>
        </label>
      </div>
    </div>
  );
};

export default InvoiceTableTopContent;
