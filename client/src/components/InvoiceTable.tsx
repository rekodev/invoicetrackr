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
  useDisclosure,
} from '@nextui-org/react';
import { Key, useCallback, useMemo, useState } from 'react';

import { columns, statusOptions } from '@/constants/table';
import useGetInvoices from '@/hooks/useGetInvoices';
import { InvoiceModel } from '@/types/models/invoice';

import InvoiceModal from './InvoiceModal';
import InvoiceTableBottomContent from './InvoiceTableBottomContent';
import InvoiceTableCell from './InvoiceTableCell';
import InvoiceTableTopContent from './InvoiceTableTopContent';

const ROWS_PER_PAGE = 10;
const INITIAL_VISIBLE_COLUMNS = [
  'id',
  'date',
  'company',
  'totalAmount',
  'status',
  'actions',
];

const InvoiceTable = () => {
  const { invoices, isInvoicesLoading } = useGetInvoices();

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [currentInvoice, setCurrentInvoice] = useState<InvoiceModel>();

  const [filterValue, setFilterValue] = useState('');
  const [selectedKeys, setSelectedKeys] = useState<Set<never> | 'all'>(
    new Set([])
  );
  const [visibleColumns, setVisibleColumns] = useState<Set<string> | 'all'>(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );
  const [statusFilter, setStatusFilter] = useState('all');
  const [rowsPerPage, setRowsPerPage] = useState(ROWS_PER_PAGE);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: 'date',
    direction: 'descending',
  });
  const [page, setPage] = useState(1);

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = useMemo(() => {
    if (visibleColumns === 'all') return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid)
    );
  }, [visibleColumns]);

  // TODO: Fix search
  const filteredItems = useMemo(() => {
    if (!invoices) return [];

    let filteredInvoices = [...invoices];

    if (hasSearchFilter) {
      filteredInvoices = filteredInvoices.filter((invoice) =>
        invoice.id.toLowerCase().includes(filterValue.toLowerCase())
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
  }, [filterValue, statusFilter, hasSearchFilter, invoices]);

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

  const handleViewClick = useCallback(
    (invoice: InvoiceModel) => {
      setCurrentInvoice(invoice);
      onOpen();
    },
    [onOpen]
  );

  const renderCell = useCallback(
    (invoice: InvoiceModel, columnKey: Key) => (
      <InvoiceTableCell
        invoice={invoice}
        columnKey={columnKey}
        onViewClick={handleViewClick}
      />
    ),
    [handleViewClick]
  );

  const topContent = useMemo(
    () => (
      <InvoiceTableTopContent
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
    ),
    [statusFilter, visibleColumns, filterValue, invoices?.length]
  );

  const bottomContent = useMemo(
    () => (
      <InvoiceTableBottomContent
        page={page}
        setPage={setPage}
        pages={pages}
        filteredItemsLength={filteredItems?.length}
        selectedKeys={selectedKeys}
      />
    ),
    [page, pages, selectedKeys, filteredItems?.length]
  );

  return (
    <section>
      <Table
        aria-label='Example table with custom cells, pagination and sorting'
        isHeaderSticky
        bottomContent={bottomContent}
        bottomContentPlacement='outside'
        classNames={{
          wrapper: 'min-h-[480px]',
        }}
        selectedKeys={selectedKeys}
        selectionMode='multiple'
        sortDescriptor={sortDescriptor}
        topContent={topContent}
        topContentPlacement='outside'
        onSelectionChange={setSelectedKeys as any}
        onSortChange={setSortDescriptor as any}
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
          isLoading={isInvoicesLoading}
          loadingContent={<Spinner color='secondary' />}
          emptyContent={!isInvoicesLoading && 'No invoices found'}
          items={sortedItems}
        >
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      {currentInvoice && (
        <InvoiceModal
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          invoiceData={currentInvoice}
        />
      )}
    </section>
  );
};

export default InvoiceTable;
