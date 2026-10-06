'use client';

import {
  CreditCardIcon,
  DocumentTextIcon,
  ExclamationCircleIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  PaperClipIcon,
  PencilSquareIcon,
  PlusIcon,
  ReceiptPercentIcon,
  TagIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import {
  Button,
  buttonVariants,
  Card,
  Checkbox,
  Chip,
  CloseButton,
  cn,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownPopover,
  DropdownTrigger,
  Input,
  Label,
  Table,
  TextField,
  Tooltip
} from '@heroui/react';
import type { ExpenseBody } from '@invoicetrackr/types';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { type Key, type ReactElement, useEffect, useMemo, useState } from 'react';

import EmptyState from '@/components/empty-state';
import MetricCard from '@/components/ui/metric-card';
import {
  EXPENSE_CATEGORIES,
  EXPENSE_PAYMENT_METHODS
} from '@/lib/constants/expense';
import { EXPENSE_WORKSPACE_PAGE } from '@/lib/constants/pages';
import type { SortDescriptor } from '@/lib/types/table';
import { formatLocalizedDate } from '@/lib/utils/date';
import { expenseListHref, readExpenseListState } from '@/lib/utils/expense-navigation';

import DeleteExpenseModal from './delete-expense-modal';
import ExpenseFormDialog from './expense-form-dialog';
import ExpenseTableBottomContent from './expense-table-bottom-content';

const CURRENT_YEAR = new Date().getFullYear();

const INITIAL_VISIBLE_COLUMNS = [
  'expenseDate',
  'supplier',
  'description',
  'category',
  'totalAmount',
  'deductibleAmount',
  'paymentMethod',
  'attachments',
  'actions'
];

type Props = {
  userId: number;
  expenses: Array<ExpenseBody>;
};

const ExpenseTable = ({ userId, expenses }: Props) => {
  const t = useTranslations('expenses');
  const locale = useLocale();
  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'EUR'
      }),
    [locale]
  );
  const columns = useMemo(
    () => [
      { name: t('table.columns.date'), uid: 'expenseDate', sortable: true },
      { name: t('table.columns.supplier'), uid: 'supplier', sortable: true },
      {
        name: t('table.columns.description'),
        uid: 'description',
        sortable: true
      },
      { name: t('table.columns.category'), uid: 'category', sortable: true },
      { name: t('table.columns.total'), uid: 'totalAmount', sortable: true },
      {
        name: t('table.columns.deductible'),
        uid: 'deductibleAmount',
        sortable: true
      },
      {
        name: t('table.columns.method'),
        uid: 'paymentMethod',
        sortable: true
      },
      { name: t('table.columns.documents'), uid: 'attachments' },
      { name: t('table.columns.actions'), uid: 'actions' }
    ],
    [t]
  );

  const searchParams = useSearchParams();
  const listParams = new URLSearchParams(searchParams.toString());
  const listState = readExpenseListState(listParams);
  const { filterValue, categoryFilter, paymentMethodFilter, hasAttachmentFilter,
    dateFrom, dateTo, rowsPerPage, page: requestedPage, sortDescriptor } = listState;
  const { column: sortColumn, direction: sortDirection } = sortDescriptor;
  const returnTo = expenseListHref(listParams);
  const updateQuery = (values: Record<string, string | number>) => {
    const params = new URLSearchParams(window.location.search);
    Object.entries(values).forEach(([key, value]) => {
      if (value === '' || value === 'all' || (key === 'page' && value === 1)) params.delete(key);
      else params.set(key, String(value));
    });
    window.history.replaceState(null, '', expenseListHref(params));
  };
  const setFilterValue = (value: string) => updateQuery({ q: value, page: 1 });
  const setCategoryFilter = (value: string) => updateQuery({ category: value, page: 1 });
  const setPaymentMethodFilter = (value: string) => updateQuery({ method: value, page: 1 });
  const setHasAttachmentFilter = (value: boolean) => updateQuery({ documents: value ? '1' : '', page: 1 });
  const setDateFrom = (value: string) => updateQuery({ from: value, page: 1 });
  const setDateTo = (value: string) => updateQuery({ to: value, page: 1 });
  const setRowsPerPage = (value: number) => updateQuery({ pageSize: value, page: 1 });
  const setPage = (value: number | ((_page: number) => number)) =>
    updateQuery({ page: typeof value === 'function' ? value(page) : value });
  const setSortDescriptor = (value: SortDescriptor) => updateQuery({
    sort: String(value.column), direction: value.direction, page: 1
  });
  const [visibleColumns] = useState<Set<string> | 'all'>(new Set(INITIAL_VISIBLE_COLUMNS));
  const [currentExpense, setCurrentExpense] = useState<ExpenseBody>();
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const headerColumns = useMemo(() => {
    if (visibleColumns === 'all') return columns;

    return columns.filter((column) =>
      Array.from(visibleColumns).includes(column.uid)
    );
  }, [columns, visibleColumns]);

  const summary = useMemo(() => {
    const currentYearExpenses = expenses.filter((expense) =>
      expense.expenseDate.startsWith(String(CURRENT_YEAR))
    );

    return currentYearExpenses.reduce(
      (acc, expense) => {
        const attachmentCount = expense.attachmentCount ?? 0;

        return {
          total: acc.total + Number(expense.totalAmount || 0),
          deductible: acc.deductible + Number(expense.deductibleAmount || 0),
          missingDocuments:
            attachmentCount > 0
              ? acc.missingDocuments
              : acc.missingDocuments + 1
        };
      },
      { total: 0, deductible: 0, missingDocuments: 0 }
    );
  }, [expenses]);

  const hasSearchFilter = Boolean(filterValue);
  const activeFilters = [
    dateFrom
      ? {
          key: 'dateFrom',
          label: `${t('filters.from')}: ${formatLocalizedDate(dateFrom, locale)}`,
          onClear: () => setDateFrom('')
        }
      : null,
    dateTo
      ? {
          key: 'dateTo',
          label: `${t('filters.to')}: ${formatLocalizedDate(dateTo, locale)}`,
          onClear: () => setDateTo('')
        }
      : null,
    categoryFilter !== 'all'
      ? {
          key: 'category',
          label: t(`categories.${categoryFilter}`),
          onClear: () => setCategoryFilter('all')
        }
      : null,
    paymentMethodFilter !== 'all'
      ? {
          key: 'paymentMethod',
          label: t(`payment_methods.${paymentMethodFilter}`),
          onClear: () => setPaymentMethodFilter('all')
        }
      : null,
    hasAttachmentFilter
      ? {
          key: 'hasAttachment',
          label: t('filters.has_attachment'),
          onClear: () => setHasAttachmentFilter(false)
        }
      : null
  ].filter(Boolean) as Array<{
    key: string;
    label: string;
    onClear: () => void;
  }>;

  const filteredItems = useMemo(() => {
    let filteredExpenses = [...expenses];

    if (hasSearchFilter) {
      filteredExpenses = filteredExpenses.filter((expense) =>
        `${expense.supplier} ${expense.description}`
          .toLowerCase()
          .includes(filterValue.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filteredExpenses = filteredExpenses.filter(
        (expense) => expense.category === categoryFilter
      );
    }

    if (paymentMethodFilter !== 'all') {
      filteredExpenses = filteredExpenses.filter(
        (expense) => expense.paymentMethod === paymentMethodFilter
      );
    }

    if (hasAttachmentFilter) {
      filteredExpenses = filteredExpenses.filter(
        (expense) => (expense.attachmentCount ?? 0) > 0
      );
    }

    if (dateFrom) {
      filteredExpenses = filteredExpenses.filter(
        (expense) => expense.expenseDate >= dateFrom
      );
    }

    if (dateTo) {
      filteredExpenses = filteredExpenses.filter(
        (expense) => expense.expenseDate <= dateTo
      );
    }

    return filteredExpenses;
  }, [
    categoryFilter,
    dateFrom,
    dateTo,
    expenses,
    filterValue,
    hasAttachmentFilter,
    hasSearchFilter,
    paymentMethodFilter
  ]);

  const pages =
    filteredItems.length === 0
      ? 1
      : Math.ceil(filteredItems.length / rowsPerPage);

  const page = Math.min(requestedPage, pages);
  useEffect(() => {
    if (requestedPage !== page) {
      const params = new URLSearchParams(window.location.search);
      params.set('page', String(page));
      window.history.replaceState(null, '', expenseListHref(params));
    }
  }, [requestedPage, page]);

  const sortedItems = filteredItems.toSorted((a, b) => {
    const column = sortColumn as keyof ExpenseBody;
    const first = a[column] ?? '';
    const second = b[column] ?? '';
    const firstValue =
      column === 'totalAmount' || column === 'deductibleAmount'
        ? Number(first)
        : String(first);
    const secondValue =
      column === 'totalAmount' || column === 'deductibleAmount'
        ? Number(second)
        : String(second);
    const cmp =
      firstValue < secondValue ? -1 : firstValue > secondValue ? 1 : 0;

    return sortDirection === 'descending' ? -cmp : cmp;
  }).slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const openAddDialog = () => {
    setCurrentExpense(undefined);
    setIsFormDialogOpen(true);
  };

  const openEditDialog = (expense: ExpenseBody) => {
    setCurrentExpense(expense);
    setIsFormDialogOpen(true);
  };

  const openDeleteModal = (expense: ExpenseBody) => {
    setCurrentExpense(expense);
    setIsDeleteModalOpen(true);
  };

  const clearFilters = () => updateQuery({
    category: 'all', method: 'all', documents: '', from: '', to: '', page: 1
  });

  const renderTooltip = (content: string, children: ReactElement) => (
    <Tooltip delay={0}>
      <Tooltip.Trigger>{children}</Tooltip.Trigger>
      <Tooltip.Content>{content}</Tooltip.Content>
    </Tooltip>
  );

  const renderCell = (expense: ExpenseBody, columnKey: Key) => {
    const attachmentCount = expense.attachmentCount ?? 0;

    switch (columnKey) {
      case 'expenseDate':
        return formatLocalizedDate(expense.expenseDate, locale);
      case 'supplier':
        return (
          <div className="flex max-w-64 items-center gap-2">
            <Link className="min-w-0 truncate text-sm font-medium hover:underline" title={expense.supplier} href={`${EXPENSE_WORKSPACE_PAGE(expense.id!)}?returnTo=${encodeURIComponent(returnTo)}`}>{expense.supplier}</Link>
            {expense.documentNumber ? (
              <Chip size="sm" variant="soft" className="max-w-24 shrink-0 px-2" title={expense.documentNumber}>
                <span className="truncate">{expense.documentNumber}</span>
              </Chip>
            ) : null}
          </div>
        );
      case 'description':
        return (
          <Tooltip delay={0}>
            <Tooltip.Trigger role={undefined} tabIndex={0} className="block max-w-48 truncate text-sm">
              {expense.description}
            </Tooltip.Trigger>
            <Tooltip.Content className="max-w-sm whitespace-normal break-words text-sm">
              {expense.description}
            </Tooltip.Content>
          </Tooltip>
        );
      case 'category':
        return (
          <Chip size="sm" variant="soft" color="accent" className="px-2">
            {t(`categories.${expense.category}`)}
          </Chip>
        );
      case 'totalAmount':
        return (
          <span className="tabular-nums">
            {currencyFormatter.format(Number(expense.totalAmount || 0))}
          </span>
        );
      case 'deductibleAmount':
        return (
          <span className="tabular-nums">
            {currencyFormatter.format(Number(expense.deductibleAmount || 0))}
          </span>
        );
      case 'paymentMethod':
        return expense.paymentMethod
          ? t(`payment_methods.${expense.paymentMethod}`)
          : t('payment_methods.not_set');
      case 'attachments':
        return attachmentCount > 0 ? (
          <span className="text-foreground flex items-center gap-1 text-sm" aria-label={t('documents.attached', { count: attachmentCount })}>
            <PaperClipIcon className="h-4 w-4" />
            {attachmentCount}
          </span>
        ) : (
          <span className="text-warning flex items-center gap-1 text-xs font-medium">
            <ExclamationCircleIcon className="h-4 w-4" />
            {t('documents.missing')}
          </span>
        );
      case 'actions':
        return (
          <div className="relative flex items-center justify-end gap-2">
            <Link aria-label={t('actions.view')} className="text-muted hover:text-foreground"
              href={`${EXPENSE_WORKSPACE_PAGE(expense.id!)}?returnTo=${encodeURIComponent(returnTo)}`}>
              <EyeIcon className="h-5 w-5" />
            </Link>
            {renderTooltip(
              t('actions.edit'),
              <button
                type="button"
                aria-label={t('actions.edit')}
                className="text-muted cursor-pointer text-lg active:opacity-50"
                onClick={() => openEditDialog(expense)}
              >
                <PencilSquareIcon className="h-5 w-5" />
              </button>
            )}
            {renderTooltip(
              t('actions.delete'),
              <button
                type="button"
                aria-label={t('actions.delete')}
                className="text-danger cursor-pointer text-lg active:opacity-50"
                onClick={() => openDeleteModal(expense)}
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        );
      default:
        return expense[columnKey as keyof ExpenseBody] ?? '';
    }
  };

  const renderEmptyContent = () => {
    if (!expenses.length) {
      return (
        <EmptyState
          className="min-h-[360px]"
          title={t('empty_state.title')}
          description={t('empty_state.description')}
          action={
            <Button size="sm" onPress={openAddDialog}>
              <PlusIcon className="h-4 w-4" />
              {t('top_content.add_new')}
            </Button>
          }
        />
      );
    }

    return (
      <EmptyState
        className="min-h-[360px]"
        title={t('empty_state.no_results_title')}
        description={t('empty_state.no_results_description')}
        action={
          <Button size="sm" variant="secondary" onPress={clearFilters}>
            {t('filters.clear')}
          </Button>
        }
      />
    );
  };

  return (
    <section className="flex max-w-full flex-col gap-4 overflow-x-hidden">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <MetricCard
          icon={<ReceiptPercentIcon className="h-4 w-4" />}
          iconVariant="accent"
          title={t('summary.total_label', { year: CURRENT_YEAR })}
          text={currencyFormatter.format(summary.total)}
        />
        <MetricCard
          icon={<DocumentTextIcon className="h-4 w-4" />}
          iconVariant="success"
          title={t('summary.deductible_label')}
          text={currencyFormatter.format(summary.deductible)}
        />
        <MetricCard
          icon={<ExclamationCircleIcon className="h-4 w-4" />}
          iconVariant={summary.missingDocuments > 0 ? 'warning' : 'accent'}
          title={t('summary.missing_documents_label')}
          text={String(summary.missingDocuments)}
        />
      </div>

      <div className="flex flex-col gap-4">
        <Card className="border">
          <Card.Content className="flex flex-col gap-3 p-3 sm:p-4">
            <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
              <div className="flex w-full min-w-0 flex-1 items-center gap-2">
                <div className="relative w-full">
                  <MagnifyingGlassIcon className="text-muted pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2" />
                  <Input
                    className="w-full pl-10"
                    variant="secondary"
                    placeholder={t('top_content.search_placeholder')}
                    value={filterValue}
                    onChange={(event) => setFilterValue(event.target.value)}
                  />
                </div>
                {filterValue && (
                  <CloseButton
                    aria-label={t('top_content.clear_search')}
                    onPress={() => setFilterValue('')}
                  />
                )}
              </div>
              <Button className="w-full sm:w-auto" onPress={openAddDialog}>
                <PlusIcon className="h-4 w-4" />
                {t('top_content.add_new')}
              </Button>
            </div>
            <div className="flex justify-start">
              <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 lg:flex lg:w-auto lg:items-center">
                <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
                  <TextField variant="secondary" className="flex-row items-center gap-2">
                    <Label className="shrink-0 whitespace-nowrap">{t('filters.from')}</Label>
                    <Input
                      className="w-36"
                      type="date"
                      value={dateFrom}
                      onChange={(event) => setDateFrom(event.target.value)}
                    />
                  </TextField>
                  <TextField variant="secondary" className="flex-row items-center gap-2">
                    <Label className="shrink-0 whitespace-nowrap">{t('filters.to')}</Label>
                    <Input
                      className="w-36"
                      type="date"
                      value={dateTo}
                      onChange={(event) => setDateTo(event.target.value)}
                    />
                  </TextField>
                </div>
                <Dropdown>
                  <DropdownTrigger
                    className={buttonVariants({
                      variant: 'tertiary',
                      className:
                        'flex w-full items-center justify-center gap-2 lg:w-auto'
                    })}
                  >
                    <TagIcon className="h-4 w-4" />
                    {categoryFilter === 'all'
                      ? t('filters.category')
                      : t(`categories.${categoryFilter}`)}
                  </DropdownTrigger>
                  <DropdownPopover>
                    <DropdownMenu
                      aria-label={t('filters.category')}
                      selectionMode="single"
                      selectedKeys={[categoryFilter]}
                      onSelectionChange={(keys) => setCategoryFilter(String(Array.from(keys)[0] ?? 'all'))}
                    >
                      <DropdownItem key="all" id="all">
                        {t('filters.all_categories')}
                      </DropdownItem>
                      {EXPENSE_CATEGORIES.map((category) => (
                        <DropdownItem key={category} id={category}>
                          {t(`categories.${category}`)}
                        </DropdownItem>
                      ))}
                    </DropdownMenu>
                  </DropdownPopover>
                </Dropdown>
                <Dropdown>
                  <DropdownTrigger
                    className={buttonVariants({
                      variant: 'tertiary',
                      className:
                        'flex w-full items-center justify-center gap-2 lg:w-auto'
                    })}
                  >
                    <CreditCardIcon className="h-4 w-4" />
                    {paymentMethodFilter === 'all'
                      ? t('filters.payment_method')
                      : t(`payment_methods.${paymentMethodFilter}`)}
                  </DropdownTrigger>
                  <DropdownPopover>
                    <DropdownMenu
                      aria-label={t('filters.payment_method')}
                      selectionMode="single"
                      selectedKeys={[paymentMethodFilter]}
                      onSelectionChange={(keys) =>
                        setPaymentMethodFilter(
                          String(Array.from(keys)[0] ?? 'all')
                        )
                      }
                    >
                      <DropdownItem key="all" id="all">
                        {t('filters.all_payment_methods')}
                      </DropdownItem>
                      {EXPENSE_PAYMENT_METHODS.map((paymentMethod) => (
                        <DropdownItem key={paymentMethod} id={paymentMethod}>
                          {t(`payment_methods.${paymentMethod}`)}
                        </DropdownItem>
                      ))}
                    </DropdownMenu>
                  </DropdownPopover>
                </Dropdown>
                <Checkbox
                  variant="primary"
                  className={buttonVariants({
                    variant: 'tertiary',
                    className: 'gap-2'
                  })}
                  isSelected={hasAttachmentFilter}
                  onChange={setHasAttachmentFilter}
                >
                  <Checkbox.Control>
                    <Checkbox.Indicator className="[&_svg]:h-full [&_svg]:w-full" />
                  </Checkbox.Control>
                  <Checkbox.Content>
                    {t('filters.has_attachment')}
                  </Checkbox.Content>
                </Checkbox>
              </div>
            </div>
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {activeFilters.map((filter) => (
                  <Chip
                    key={filter.key}
                    color="accent"
                    variant="soft"
                    className="gap-1"
                  >
                    <span>{filter.label}</span>
                    <button
                      type="button"
                      aria-label={t('filters.remove_filter', {
                        filter: filter.label
                      })}
                      className="hover:text-foreground"
                      onClick={filter.onClear}
                    >
                      <XMarkIcon className="h-3.5 w-3.5" />
                    </button>
                  </Chip>
                ))}
                <Button variant="ghost" onPress={clearFilters}>
                  {t('filters.clear_all')}
                </Button>
              </div>
            )}
          </Card.Content>
        </Card>
        <div className="flex items-center justify-between">
          <span className="section-eyebrow text-muted">
            {expenses.length === 1
              ? t('top_content.total_singular')
              : t('top_content.total_plural', { count: expenses.length })}
          </span>
          <label className="section-eyebrow text-muted flex items-center">
            {t('table.rows_per_page')}
            <select
              className="section-eyebrow text-muted bg-transparent outline-none"
              onChange={(event) => setRowsPerPage(Number(event.target.value))}
              value={rowsPerPage}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
            </select>
          </label>
        </div>
      </div>

      <Table variant="secondary">
        <Table.ScrollContainer className="w-full max-w-full overflow-x-auto">
          <Table.Content
            className="min-w-full"
            aria-label={t('table.a11y.table_label')}
            sortDescriptor={sortDescriptor as any}
            onSortChange={setSortDescriptor}
          >
            <Table.Header>
              {headerColumns.map((column, index) => (
                <Table.Column
                  isRowHeader={index === 0}
                  key={column.uid}
                  id={column.uid}
                  allowsSorting={column.sortable}
                  className={cn({
                    'text-center': column.uid === 'actions'
                  })}
                >
                  {column.name}
                </Table.Column>
              ))}
            </Table.Header>
            <Table.Body>
              {sortedItems.length ? (
                sortedItems.map((expense) => (
                  <Table.Row key={expense.id} id={String(expense.id)}>
                    {headerColumns.map((column) => (
                      <Table.Cell key={column.uid} className="whitespace-nowrap py-2">
                        {renderCell(expense, column.uid)}
                      </Table.Cell>
                    ))}
                  </Table.Row>
                ))
              ) : (
                <Table.Row id="empty">
                  <Table.Cell colSpan={headerColumns.length}>
                    {renderEmptyContent()}
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>

      <ExpenseTableBottomContent
        page={page}
        setPage={setPage}
        pages={pages}
        rowsPerPage={rowsPerPage}
        filteredItemsLength={filteredItems.length}
      />

      <ExpenseFormDialog
        userId={userId}
        isOpen={isFormDialogOpen}
        returnTo={returnTo}
        onClose={() => setIsFormDialogOpen(false)}
        mode={currentExpense ? 'edit' : 'add'}
        expenseData={currentExpense}
      />

      {currentExpense && (
        <DeleteExpenseModal
          userId={userId}
          expenseData={currentExpense}
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
        />
      )}
    </section>
  );
};

export default ExpenseTable;
