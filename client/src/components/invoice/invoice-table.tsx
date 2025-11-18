'use client';

import {
  SortDescriptor,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  cn,
  useDisclosure
} from '@heroui/react';
import { useMemo, useState } from 'react';
import { InvoiceBody } from '@invoicetrackr/types';
import { useTranslations } from 'next-intl';

import { Currency } from '@/lib/types/currency';
import { getInvoiceDueStatus } from '@/lib/utils/invoice';
import useInvoiceTableActionHandlers from '@/lib/hooks/invoice/use-invoice-table-action-handlers';

import DeleteInvoiceModal from './delete-invoice-modal';
import InvoiceModal from './invoice-modal';
import InvoiceTableBottomContent from './invoice-table-bottom-content';
import InvoiceTableCell from './invoice-table-cell';
import InvoiceTableTopContent from './invoice-table-top-content';

const ROWS_PER_PAGE = 10;
const INITIAL_VISIBLE_COLUMNS = [
  'id',
  'date',
  'receiver',
  'totalAmount',
  'status',
  'actions'
];

type Props = {
  userId: number;
  invoices: Array<InvoiceBody>;
  currency: Currency;
  language: string;
};

const InvoiceTable = ({ userId, invoices, currency, language }: Props) => {
  const t = useTranslations('invoices.table');

  const columns = useMemo(
    () => [
      { name: t('columns.id'), uid: 'id', sortable: true },
      { name: t('columns.receiver'), uid: 'receiver', sortable: true },
      { name: t('columns.amount'), uid: 'totalAmount', sortable: true },
      { name: t('columns.date'), uid: 'date', sortable: true },
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

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [currentInvoice, setCurrentInvoice] = useState<InvoiceBody>();

  const [filterValue, setFilterValue] = useState('');
  const [selectedKeys] = useState<Set<never> | 'all'>(new Set([]));
  const [visibleColumns, setVisibleColumns] = useState<Set<string> | 'all'>(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );
  const [statusFilter, setStatusFilter] = useState('all');
  const [rowsPerPage, setRowsPerPage] = useState(ROWS_PER_PAGE);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: 'date',
    direction: 'descending'
  });
  const [page, setPage] = useState(1);

  const {
    handleViewInvoice,
    handleEditInvoice,
    handleDeleteInvoice,
    isDeleteInvoiceModalOpen,
    handleCloseDeleteInvoiceModal
  } = useInvoiceTableActionHandlers({ setCurrentInvoice, onOpen });

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = useMemo(() => {
    if (visibleColumns === 'all') return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid)
    );
  }, [visibleColumns, columns]);

  const filteredItems = useMemo(() => {
    if (!invoices) return [];

    let filteredInvoices = [...invoices];

    if (hasSearchFilter) {
      filteredInvoices = filteredInvoices.filter((invoice) =>
        invoice.invoiceId
          .toString()
          .toLowerCase()
          .includes(filterValue.toLowerCase())
      );
    }
    if (
      statusFilter !== 'all' &&
      Array.from(statusFilter).length !== statusOptions.length
    ) {
      filteredInvoices = filteredInvoices.filter((invoice) =>
        Array.from(statusFilter).includes(invoice.status)
      );
    }

    return filteredInvoices;
  }, [
    filterValue,
    statusFilter,
    hasSearchFilter,
    invoices,
    statusOptions.length
  ]);

  const pages =
    filteredItems.length === 0 || !filteredItems
      ? 1
      : Math.ceil(filteredItems.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems?.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = useMemo(() => {
    if (!items) return [];

    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column as 'date'];
      const second = b[sortDescriptor.column as 'date'];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === 'descending' ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const renderTopContent = () => (
    <InvoiceTableTopContent
      columns={columns}
      statusOptions={statusOptions}
      filterValue={filterValue}
      setFilterValue={setFilterValue}
      visibleColumns={visibleColumns}
      setPage={setPage}
      setRowsPerPage={setRowsPerPage}
      setStatusFilter={setStatusFilter}
      setVisibleColumns={setVisibleColumns}
      statusFilter={statusFilter}
      invoicesLength={invoices?.length}
    />
  );

  const renderBottomContent = () => (
    <InvoiceTableBottomContent
      page={page}
      setPage={setPage}
      pages={pages}
      filteredItemsLength={filteredItems?.length}
      selectedKeys={selectedKeys}
    />
  );

  return (
    <section>
      <Table
        aria-label={t('a11y.table_label')}
        isHeaderSticky
        bottomContent={renderBottomContent()}
        bottomContentPlacement="outside"
        classNames={{
          wrapper:
            'min-h-[480px] bg-transparent dark:border dark:border-default-100'
        }}
        sortDescriptor={sortDescriptor}
        topContent={renderTopContent()}
        topContentPlacement="outside"
        onSortChange={setSortDescriptor}
      >
        <TableHeader columns={headerColumns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              align={column.uid === 'actions' ? 'center' : 'start'}
              allowsSorting={column.sortable}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody
          loadingContent={<Spinner color="secondary" />}
          emptyContent={!invoices.length && 'No invoices found'}
          items={sortedItems}
        >
          {(item) => {
            const { isPastDue } = getInvoiceDueStatus(item);

            return (
              <TableRow
                className={cn({ 'bg-danger/10': isPastDue })}
                key={item.id}
              >
                {(columnKey) => (
                  <TableCell>
                    <InvoiceTableCell
                      userId={userId}
                      language={language}
                      currency={currency}
                      invoice={item}
                      columnKey={columnKey}
                      onView={handleViewInvoice}
                      onEdit={handleEditInvoice}
                      onDelete={handleDeleteInvoice}
                    />
                  </TableCell>
                )}
              </TableRow>
            );
          }}
        </TableBody>
      </Table>

      {currentInvoice && (
        <InvoiceModal
          language={language}
          currency={currency}
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          invoiceData={currentInvoice}
          senderSignatureImage={currentInvoice.senderSignature as string}
        />
      )}
      {currentInvoice && (
        <DeleteInvoiceModal
          userId={userId}
          invoiceData={currentInvoice}
          isOpen={isDeleteInvoiceModalOpen}
          onClose={handleCloseDeleteInvoiceModal}
        />
      )}
    </section>
  );
};

export default InvoiceTable;
