'use client';

import { Table } from '@heroui/react';
import type { InvoiceBody } from '@invoicetrackr/types';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import EmptyState from '@/components/empty-state';
import type { SortDescriptor } from '@/lib/types/table';

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

type Props = { invoices: Array<InvoiceBody>; userId: number };

export default function InvoiceTable({ invoices, userId }: Props) {
  const t = useTranslations('invoices.table');
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
    { name: t('status.paid'), uid: 'paid' },
    { name: t('status.canceled'), uid: 'canceled' },
    { name: t('status.pending'), uid: 'pending' }
  ];
  const [filterValue, setFilterValue] = useState('');
  const [visibleColumns, setVisibleColumns] = useState<Set<string> | 'all'>(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );
  const [statusFilter, setStatusFilter] = useState('all');
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
  const filtered = invoices.filter(
    (invoice) =>
      (!filterValue ||
        `${invoice.invoiceId || ''} ${invoice.receiver.name}`
          .toLowerCase()
          .includes(filterValue.toLowerCase())) &&
      (statusFilter === 'all' ||
        Array.from(statusFilter).includes(invoice.status))
  );
  const sorted = [...filtered].sort((a, b) => {
    const field = sortDescriptor.column;
    const first = String(
      field === 'receiver'
        ? a.receiver.name
        : (a[field as keyof InvoiceBody] ?? '')
    );
    const second = String(
      field === 'receiver'
        ? b.receiver.name
        : (b[field as keyof InvoiceBody] ?? '')
    );
    const order = first.localeCompare(second, undefined, { numeric: true });
    return sortDescriptor.direction === 'descending' ? -order : order;
  });
  const pages = Math.max(1, Math.ceil(sorted.length / rowsPerPage));
  const items = sorted.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <section className="flex max-w-full flex-col gap-4 overflow-x-hidden">
      <InvoiceTableTopContent
        userId={userId}
        columns={columns}
        statusOptions={statusOptions}
        filterValue={filterValue}
        setFilterValue={setFilterValue}
        visibleColumns={visibleColumns}
        setVisibleColumns={setVisibleColumns}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        setPage={setPage}
        setRowsPerPage={setRowsPerPage}
        invoicesLength={invoices.length}
      />
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
