'use client';

import { XMarkIcon } from '@heroicons/react/24/outline';
import { Button, Chip, cn, Table } from '@heroui/react';
import type {
  InvoiceListItem,
  InvoiceListQuery,
  InvoiceListSort,
  Pagination
} from '@invoicetrackr/types';
import { useLocale, useTranslations } from 'next-intl';
import { useMemo, useRef, useState } from 'react';

import EmptyState from '@/components/empty-state';
import useListNavigation from '@/lib/hooks/use-list-navigation';
import type { SortDescriptor } from '@/lib/types/table';
import { formatLocalizedDate } from '@/lib/utils/date';
import { invoiceListQueryHref } from '@/lib/utils/invoice-navigation';

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

const SEARCH_DEBOUNCE_MS = 300;

type Props = {
  invoices: Array<InvoiceListItem>;
  pagination: Pagination;
  query: InvoiceListQuery;
  userId: number;
  isEmailVerified?: boolean;
  preferredLanguage?: string;
};

export default function InvoiceTable({
  invoices,
  pagination,
  query,
  userId,
  isEmailVerified = false,
  preferredLanguage = 'lt'
}: Props) {
  const t = useTranslations('invoices.table');
  const locale = useLocale();
  const { update, isPending } = useListNavigation(query, invoiceListQueryHref);
  const [searchValue, setSearchValue] = useState(query.q ?? '');
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
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
  const [visibleColumns, setVisibleColumns] = useState<Set<string> | 'all'>(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );
  const headerColumns =
    visibleColumns === 'all'
      ? columns
      : columns.filter((column) => visibleColumns.has(column.uid));
  const sortDescriptor: SortDescriptor = {
    column: query.sort,
    direction: query.direction
  };
  const pages = Math.max(1, Math.ceil(pagination.total / pagination.pageSize));
  const hasFilters = Boolean(
    query.q ||
      query.status ||
      query.overdue ||
      query.issuedFrom ||
      query.issuedTo ||
      query.paidFrom ||
      query.paidTo
  );

  const onSearchChange = (value: string) => {
    setSearchValue(value);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(
      () => update({ q: value.trim() || undefined, page: 1 }),
      SEARCH_DEBOUNCE_MS
    );
  };

  const formatRange = (from?: string, to?: string) =>
    [from, to]
      .map((date) => (date ? formatLocalizedDate(date, locale) : '…'))
      .join(' – ');
  const rangeFilters = [
    query.issuedFrom || query.issuedTo
      ? {
          key: 'issued',
          label: t('filters.issued_range', {
            range: formatRange(query.issuedFrom, query.issuedTo)
          }),
          clear: { issuedFrom: undefined, issuedTo: undefined }
        }
      : null,
    query.paidFrom || query.paidTo
      ? {
          key: 'paid',
          label: t('filters.paid_range', {
            range: formatRange(query.paidFrom, query.paidTo)
          }),
          clear: { paidFrom: undefined, paidTo: undefined }
        }
      : null
  ].filter((filter) => filter !== null);

  return (
    <section
      className={cn(
        'flex max-w-full flex-col gap-field overflow-x-hidden transition-opacity',
        { 'opacity-60': isPending }
      )}
      aria-busy={isPending}
    >
      <InvoiceTableTopContent
        columns={columns}
        statusOptions={statusOptions}
        searchValue={searchValue}
        onSearchChange={onSearchChange}
        statusFilter={query.status ?? 'all'}
        onStatusChange={(status) =>
          update({
            status: status === 'all' ? undefined : (status as InvoiceListQuery['status']),
            page: 1
          })
        }
        overdueOnly={Boolean(query.overdue)}
        onOverdueToggle={() =>
          update({ overdue: query.overdue ? undefined : '1', page: 1 })
        }
        visibleColumns={visibleColumns}
        setVisibleColumns={setVisibleColumns}
        rowsPerPage={pagination.pageSize}
        onRowsPerPageChange={(pageSize) => update({ pageSize, page: 1 })}
        total={pagination.total}
      />
      {rangeFilters.length > 0 ? (
        <div className="flex flex-wrap items-center gap-actions">
          {rangeFilters.map((filter) => (
            <Chip key={filter.key} color="accent" variant="soft" className="gap-field-content">
              <span>{filter.label}</span>
              <button
                type="button"
                aria-label={t('filters.remove_filter', { filter: filter.label })}
                className="hover:text-foreground"
                onClick={() => update({ ...filter.clear, page: 1 })}
              >
                <XMarkIcon className="h-3.5 w-3.5" />
              </button>
            </Chip>
          ))}
          <Button
            variant="ghost"
            onPress={() =>
              update({
                issuedFrom: undefined,
                issuedTo: undefined,
                paidFrom: undefined,
                paidTo: undefined,
                page: 1
              })
            }
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
            onSortChange={(descriptor) =>
              update({
                sort: descriptor.column as InvoiceListSort,
                direction: descriptor.direction,
                page: 1
              })
            }
          >
            <Table.Header>
              {headerColumns.map((column, index) => (
                <Table.Column
                  key={column.uid}
                  id={column.uid}
                  isRowHeader={index === 0}
                  allowsSorting={column.sortable}
                  className={column.uid === 'actions' ? 'text-right' : undefined}
                >
                  {column.name}
                </Table.Column>
              ))}
            </Table.Header>
            <Table.Body>
              {invoices.length ? (
                invoices.map((invoice) => (
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
                        hasFilters
                          ? 'empty_state.no_results_title'
                          : 'empty_state.title'
                      )}
                      description={t(
                        hasFilters
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
        page={pagination.page}
        pages={pages}
        rowsPerPage={pagination.pageSize}
        total={pagination.total}
        onPageChange={(page) => update({ page })}
      />
    </section>
  );
}
