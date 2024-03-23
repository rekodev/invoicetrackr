'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@nextui-org/react';
import { Key, useCallback, useMemo, useState } from 'react';

import { UserModel } from '@/types/models/user';
import { SortDirection } from '@/types/table';

import InvoiceTableBottomContent from './InvoiceTableBottomContent';
import InvoiceTableCell from './InvoiceTableCell';
import InvoiceTableTopContent from './InvoiceTableTopContent';
import { columns, statusOptions, users } from '../data';

const INITIAL_VISIBLE_COLUMNS = ['name', 'role', 'status', 'actions'];
const ROWS_PER_PAGE = 8;
const TABLE_HEIGHT = '568px';

const InvoiceTable = () => {
  const [filterValue, setFilterValue] = useState('');
  const [selectedKeys, setSelectedKeys] = useState<Set<never> | 'all'>(
    new Set([])
  );
  const [visibleColumns, setVisibleColumns] = useState<Set<string> | 'all'>(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );
  const [statusFilter, setStatusFilter] = useState('all');
  const [rowsPerPage, setRowsPerPage] = useState(ROWS_PER_PAGE);
  const [sortDescriptor, setSortDescriptor] = useState<{
    column: string;
    direction: SortDirection;
  }>({
    column: 'age',
    direction: 'ascending',
  });
  const [page, setPage] = useState(1);

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = useMemo(() => {
    if (visibleColumns === 'all') return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid)
    );
  }, [visibleColumns]);

  const filteredItems = useMemo(() => {
    let filteredUsers = [...users];

    if (hasSearchFilter) {
      filteredUsers = filteredUsers.filter((user) =>
        user.name.toLowerCase().includes(filterValue.toLowerCase())
      );
    }
    if (
      statusFilter !== 'all' &&
      Array.from(statusFilter).length !== statusOptions.length
    ) {
      filteredUsers = filteredUsers.filter((user) =>
        Array.from(statusFilter).includes(user.status)
      );
    }

    return filteredUsers;
  }, [filterValue, statusFilter, hasSearchFilter]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column as 'age'];
      const second = b[sortDescriptor.column as 'age'];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === 'descending' ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const renderCell = useCallback(
    (user: UserModel, columnKey: Key) => (
      <InvoiceTableCell user={user} columnKey={columnKey} />
    ),
    []
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
        usersLength={users.length}
      />
    ),
    [statusFilter, visibleColumns, filterValue]
  );

  const bottomContent = useMemo(
    () => (
      <InvoiceTableBottomContent
        page={page}
        setPage={setPage}
        pages={pages}
        filteredItemsLength={filteredItems.length}
        selectedKeys={selectedKeys}
      />
    ),
    [page, pages, selectedKeys, filteredItems.length]
  );

  return (
    <Table
      aria-label='Example table with custom cells, pagination and sorting'
      isHeaderSticky
      bottomContent={bottomContent}
      bottomContentPlacement='outside'
      classNames={{
        wrapper: `max-h-[${TABLE_HEIGHT}] min-h-[${TABLE_HEIGHT}]`,
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
      <TableBody emptyContent={'No users found'} items={sortedItems}>
        {(item) => (
          <TableRow key={item.id}>
            {(columnKey) => (
              <TableCell>{renderCell(item, columnKey)}</TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default InvoiceTable;
