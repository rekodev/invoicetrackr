'use client';

import { XMarkIcon } from '@heroicons/react/24/outline';
import { Button, Chip, Table } from '@heroui/react';
import type { InvoiceListItem } from '@invoicetrackr/types';
import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';

import EmptyState from '@/components/empty-state';
import type { SortDescriptor } from '@/lib/types/table';
import { formatLocalizedDate } from '@/lib/utils/date';
import { getInvoicePaymentStatus } from '@/lib/utils/invoice';
import {
  matchesInvoiceListFilters,
  readInvoiceListState,
  writeInvoiceListState
} from '@/lib/utils/invoice-navigation';

import InvoiceTableBottomContent from './invoice-table-bottom-content';
import InvoiceTableCell from './invoice-table-cell';
import InvoiceTableTopContent from './invoice-table-top-content';

const INITIAL_VISIBLE_COLUMNS = [
  'id',
  'date',
  'receiver',
  'totalAmount',
  'lifecycleStatus',
  'status',
  'actions'
];

type Props = { invoices: Array<InvoiceListItem>; userId: number; isEmailVerified?: boolean; preferredLanguage?: string };

export default function InvoiceTable({ invoices, userId, isEmailVerified = false, preferredLanguage = 'lt' }: Props) {
  const t = useTranslations('invoices.table');
  const locale = useLocale();
  const searchParams = useSearchParams();
  const [initialState] = useState(() =>
    readInvoiceListState(new URLSearchParams(searchParams?.toString()))
  );
  const columns = useMemo(
    () => [
      { name: t('columns.id'), uid: 'id', sortable: true },
      { name: t('columns.receiver'), uid: 'receiver', sortable: true },
      { name: t('columns.amount'), uid: 'totalAmount', sortable: true },
      { name: t('columns.date'), uid: 'date', sortable: true },
      {
        name: t('columns.lifecycle_status'),
        uid: 'lifecycleStatus',
        sortable: true
      },
      { name: t('columns.status'), uid: 'status', sortable: true },
      { name: t('columns.actions'), uid: 'actions' }
    ],
    [t]
  );
  const statusOptions = [
    { name: t('filters.all'), uid: 'all' },
    { name: t('status.open'), uid: 'open' },
    { name: t('status.partial'), uid: 'partial' },
    { name: t('status.no_payment_due'), uid: 'no_payment_due' },
    { name: t('status.paid'), uid: 'paid' },
    { name: t('status.canceled'), uid: 'canceled' },
    { name: t('status.pending'), uid: 'pending' }
  ];
  const [filterValue, setFilterValue] = useState(initialState.filterValue);
  const [visibleColumns, setVisibleColumns] = useState<Set<string> | 'all'>(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );
  const [statusFilter, setStatusFilter] = useState(initialState.statusFilter);
  const [overdueOnly, setOverdueOnly] = useState(initialState.overdueOnly);
  const [issuedRange, setIssuedRange] = useState({
    from: initialState.issuedFrom,
    to: initialState.issuedTo
  });
  const [paidRange, setPaidRange] = useState({
    from: initialState.paidFrom,
    to: initialState.paidTo
  });
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: 'date',
    direction: 'descending'
  });
  const [page, setPage] = useState(1);
  const headerColumns =
    visibleColumns === 'all'
      ? columns
      : columns.filter((column) => visibleColumns.has(column.uid));
  const filters = {
    filterValue,
    statusFilter,
    overdueOnly,
    issuedFrom: issuedRange.from,
    issuedTo: issuedRange.to,
    paidFrom: paidRange.from,
    paidTo: paidRange.to
  };
  const listHref = writeInvoiceListState(filters);
  useEffect(() => {
    if (`${window.location.pathname}${window.location.search}` !== listHref)
      window.history.replaceState(null, '', listHref);
  }, [listHref]);
  const formatRange = (range: { from: string; to: string }) =>
    [range.from, range.to]
      .map((date) => (date ? formatLocalizedDate(date, locale) : '…'))
      .join(' – ');
  const rangeFilters = [
    issuedRange.from || issuedRange.to
      ? {
          key: 'issued',
          label: t('filters.issued_range', { range: formatRange(issuedRange) }),
          onClear: () => setIssuedRange({ from: '', to: '' })
        }
      : null,
    paidRange.from || paidRange.to
      ? {
          key: 'paid',
          label: t('filters.paid_range', { range: formatRange(paidRange) }),
          onClear: () => setPaidRange({ from: '', to: '' })
        }
      : null
  ].filter((filter) => filter !== null);
  const filtered = invoices.filter((invoice) =>
    matchesInvoiceListFilters(invoice, filters)
  );
  const sorted = filtered.toSorted((a, b) => {
    const field = sortDescriptor.column;
    const first = String(
      field === 'receiver'
        ? a.receiver.name
        : field === 'status' ? getInvoicePaymentStatus(a) : (a[field as keyof InvoiceListItem] ?? '')
    );
    const second = String(
      field === 'receiver'
        ? b.receiver.name
        : field === 'status' ? getInvoicePaymentStatus(b) : (b[field as keyof InvoiceListItem] ?? '')
    );
    const order = first.localeCompare(second, undefined, { numeric: true });
    return sortDescriptor.direction === 'descending' ? -order : order;
  });
  const pages = Math.max(1, Math.ceil(sorted.length / rowsPerPage));
  const items = sorted.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <section className="flex max-w-full flex-col gap-4 overflow-x-hidden">
      <InvoiceTableTopContent
        columns={columns}
        statusOptions={statusOptions}
        filterValue={filterValue}
        setFilterValue={setFilterValue}
        visibleColumns={visibleColumns}
        setVisibleColumns={setVisibleColumns}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        overdueOnly={overdueOnly}
        setOverdueOnly={setOverdueOnly}
        setPage={setPage}
        setRowsPerPage={setRowsPerPage}
        invoicesLength={invoices.length}
      />
      {rangeFilters.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          {rangeFilters.map((filter) => (
            <Chip key={filter.key} color="accent" variant="soft" className="gap-1">
              <span>{filter.label}</span>
              <button
                type="button"
                aria-label={t('filters.remove_filter', { filter: filter.label })}
                className="hover:text-foreground"
                onClick={() => {
                  filter.onClear();
                  setPage(1);
                }}
              >
                <XMarkIcon className="h-3.5 w-3.5" />
              </button>
            </Chip>
          ))}
          <Button
            variant="ghost"
            onPress={() => {
              setIssuedRange({ from: '', to: '' });
              setPaidRange({ from: '', to: '' });
              setPage(1);
            }}
          >
            {t('filters.clear_dates')}
          </Button>
        </div>
      ) : null}
      <Table variant="secondary">
        <Table.ScrollContainer className="w-full max-w-full overflow-x-auto">
          <Table.Content
            className="min-w-full"
            aria-label={t('a11y.table_label')}
            sortDescriptor={sortDescriptor as any}
            onSortChange={setSortDescriptor}
          >
            <Table.Header>
              {headerColumns.map((column, index) => (
                <Table.Column
                  key={column.uid}
                  id={column.uid}
                  isRowHeader={index === 0}
                  allowsSorting={column.sortable}
                >
                  {column.name}
                </Table.Column>
              ))}
            </Table.Header>
            <Table.Body>
              {items.length ? (
                items.map((invoice) => (
                  <Table.Row key={invoice.id} id={String(invoice.id)}>
                    {headerColumns.map((column) => (
                      <Table.Cell key={column.uid}>
                        <InvoiceTableCell
                          invoice={invoice}
                          columnKey={column.uid}
                          userId={userId}
                          isEmailVerified={isEmailVerified}
                          preferredLanguage={preferredLanguage}
                        />
                      </Table.Cell>
                    ))}
                  </Table.Row>
                ))
              ) : (
                <Table.Row id="empty">
                  <Table.Cell colSpan={headerColumns.length}>
                    <EmptyState
                      className="min-h-[360px]"
                      title={t(
                        invoices.length
                          ? 'empty_state.no_results_title'
                          : 'empty_state.title'
                      )}
                      description={t(
                        invoices.length
                          ? 'empty_state.no_results_description'
                          : 'empty_state.description'
                      )}
                    />
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>
      <InvoiceTableBottomContent
        page={page}
        setPage={setPage}
        pages={pages}
        rowsPerPage={rowsPerPage}
        filteredItemsLength={filtered.length}
      />
    </section>
  );
}
