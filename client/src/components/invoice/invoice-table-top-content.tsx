import {
  Button,
  CloseButton,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownPopover,
  DropdownTrigger,
  Input,
  buttonVariants,
  useOverlayState
} from '@heroui/react';
import { ChangeEvent, Dispatch, SetStateAction, useCallback } from 'react';
import {
  ChevronDownIcon,
  DocumentArrowDownIcon,
  MagnifyingGlassIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { ADD_NEW_INVOICE_PAGE } from '@/lib/constants/pages';
import { capitalize } from '@/lib/utils';

import IncomeJournalExportModal from './income-journal-export-modal';

type Props = {
  userId: number;
  columns: Array<{ name: string; uid: string; sortable?: boolean }>;
  statusOptions: Array<{ name: string; uid: string }>;
  filterValue: string;
  setFilterValue: Dispatch<SetStateAction<string>>;
  statusFilter: string;
  setStatusFilter: Dispatch<SetStateAction<string>>;
  visibleColumns: Set<string> | 'all';
  setVisibleColumns: Dispatch<SetStateAction<Set<string> | 'all'>>;
  setPage: Dispatch<SetStateAction<number>>;
  setRowsPerPage: Dispatch<SetStateAction<number>>;
  invoicesLength: number | undefined;
};

const InvoiceTableTopContent = ({
  userId,
  columns,
  statusOptions,
  filterValue,
  setFilterValue,
  visibleColumns,
  setVisibleColumns,
  statusFilter,
  setStatusFilter,
  setPage,
  setRowsPerPage,
  invoicesLength
}: Props) => {
  const t = useTranslations('invoices');
  const router = useRouter();
  const {
    isOpen: isIncomeJournalModalOpen,
    open: openIncomeJournalModal,
    setOpen: onIncomeJournalModalOpenChange
  } = useOverlayState();

  const totalInvoicesText = invoicesLength
    ? invoicesLength === 1
      ? t('top_content.total_singular')
      : t('top_content.total_plural', { count: invoicesLength })
    : t('top_content.total_plural', { count: 0 });

  const handleAddNewInvoice = () => {
    router.push(ADD_NEW_INVOICE_PAGE);
  };

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
    <div className="flex flex-col gap-4 pt-1">
      <div className="flex items-end justify-between gap-3">
        <div className="flex w-full items-center gap-2 sm:max-w-[44%]">
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
        <div className="flex gap-3">
          <Dropdown>
            <DropdownTrigger
              className={buttonVariants({
                variant: 'secondary',
                className: 'hidden items-center justify-center gap-2 sm:flex'
              })}
            >
              {t('table.filters.status')}
              <ChevronDownIcon className="h-4 w-4 text-sm" />
            </DropdownTrigger>
            <DropdownPopover>
              <DropdownMenu
                disallowEmptySelection
                aria-label={t('table.filters.a11y.status_label')}
                selectedKeys={statusFilter}
                selectionMode="multiple"
                onSelectionChange={setStatusFilter as any}
              >
                {statusOptions.map((status) => (
                  <DropdownItem
                    key={status.uid}
                    id={status.uid}
                    textValue={capitalize(status.name)}
                    className="capitalize"
                  >
                    {capitalize(status.name)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </DropdownPopover>
          </Dropdown>
          <Dropdown>
            <DropdownTrigger
              className={buttonVariants({
                variant: 'secondary',
                className: 'hidden items-center justify-center sm:flex'
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
                onSelectionChange={setVisibleColumns as any}
              >
                {columns.map((column) => (
                  <DropdownItem
                    key={column.uid}
                    id={column.uid}
                    textValue={capitalize(column.name)}
                    className="capitalize"
                  >
                    {capitalize(column.name)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </DropdownPopover>
          </Dropdown>
          <Button variant="secondary" onPress={openIncomeJournalModal}>
            <DocumentArrowDownIcon className="h-4 w-4" />
            {t('income_journal.export')}
          </Button>
          <Button onPress={handleAddNewInvoice}>
            <PlusIcon className="h-4 w-4" />
            {t('top_content.add_new')}
          </Button>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="section-eyebrow text-default-500">
          {totalInvoicesText}
        </span>
        <label className="section-eyebrow text-default-500 flex items-center">
          {t('table.rows_per_page')}
          <select
            className="section-eyebrow text-default-500 bg-transparent outline-none"
            onChange={onRowsPerPageChange}
            defaultValue={10}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="15">15</option>
          </select>
        </label>
      </div>
      <IncomeJournalExportModal
        userId={userId}
        isOpen={isIncomeJournalModalOpen}
        onOpenChange={onIncomeJournalModalOpenChange}
      />
    </div>
  );
};

export default InvoiceTableTopContent;
