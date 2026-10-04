'use client';

import { ArrowLeftIcon, ChartPieIcon, DocumentTextIcon, PencilSquareIcon, ReceiptPercentIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Button, buttonVariants, Card, Chip } from '@heroui/react';
import type { ExpenseAttachment, ExpenseBody } from '@invoicetrackr/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';

import MetricCard from '@/components/ui/metric-card';
import { formatLocalizedDate } from '@/lib/utils/date';

import DeleteExpenseModal from './delete-expense-modal';
import ExpenseDocuments from './expense-documents';
import ExpenseFormDialog from './expense-form-dialog';

export default function ExpenseWorkspace({ userId, expense, attachments, returnTo }: {
  userId: number; expense: ExpenseBody; attachments: ExpenseAttachment[] | null; returnTo: string;
}) {
  const t = useTranslations('expenses.workspace');
  const fields = useTranslations('expenses.form_dialog.fields');
  const categories = useTranslations('expenses.categories');
  const methods = useTranslations('expenses.payment_methods');
  const locale = useLocale();
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const money = (value: string | null | undefined, currency = expense.currency) =>
    value == null || value === '' ? t('not_set') : new Intl.NumberFormat(locale, {
      style: 'currency', currency: currency.toUpperCase()
    }).format(Number(value));
  const percentage = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(Number(expense.businessUsePercentage));
  const timestamp = (value?: string | null) => value
    ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
    : t('not_set');
  const details = [
    [fields('supplier'), expense.supplier],
    [fields('description'), expense.description],
    [fields('category'), categories(expense.category)],
    [fields('document_number'), expense.documentNumber || t('not_set')],
    [fields('expense_date'), formatLocalizedDate(expense.expenseDate, locale)],
    [fields('payment_date'), expense.paymentDate ? formatLocalizedDate(expense.paymentDate, locale) : t('not_set')],
    [fields('payment_method'), expense.paymentMethod ? methods(expense.paymentMethod) : methods('not_set')],
    [fields('currency'), expense.currency.toUpperCase()],
    [t('eur_amount'), money(expense.eurAmount, 'eur')],
    [fields('vat_amount'), money(expense.vatAmount)],
    [fields('notes'), expense.notes || t('not_set')],
    [t('created_at'), timestamp(expense.createdAt)],
    [t('updated_at'), timestamp(expense.updatedAt)]
  ];

  return <section className="mx-auto flex w-full max-w-7xl flex-col gap-5 pb-10">
    <Link href={returnTo} className={buttonVariants({ variant: 'tertiary', className: 'self-start' })}>
      <ArrowLeftIcon className="size-4" />{t('back')}
    </Link>
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0 space-y-2">
        <h1 className="break-words text-2xl font-semibold">{expense.supplier}</h1>
        <Chip variant="soft">{categories(expense.category)}</Chip>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onPress={() => setEditOpen(true)}><PencilSquareIcon className="size-4" />{t('edit')}</Button>
        <Button variant="danger" onPress={() => setDeleteOpen(true)}><TrashIcon className="size-4" />{t('delete')}</Button>
      </div>
    </header>
    <div className="grid gap-3 sm:grid-cols-3">
      <MetricCard icon={<ReceiptPercentIcon className="size-4" />} iconVariant="accent" title={fields('total_amount')} text={money(expense.totalAmount)} />
      <MetricCard icon={<ChartPieIcon className="size-4" />} iconVariant="accent" title={fields('business_use_percentage')} text={`${percentage}%`} />
      <MetricCard icon={<DocumentTextIcon className="size-4" />} iconVariant="success" title={fields('deductible_amount')} text={money(expense.deductibleAmount)} />
    </div>
    <Card className="border"><Card.Content className="space-y-2">
      <h2 className="font-medium">{t('deduction_title')}</h2>
      <p className="tabular-nums">{t('deduction_formula', { amount: money(expense.totalAmount), percentage, deductible: money(expense.deductibleAmount) })}</p>
      <p className="text-muted text-sm">{t('deduction_explanation')}</p>
    </Card.Content></Card>
    <div className="grid items-start gap-5 lg:grid-cols-2">
      <Card className="border"><Card.Content className="space-y-4">
        <h2 className="font-medium">{t('details')}</h2>
        <dl className="grid gap-4 sm:grid-cols-2">
          {details.map(([label, value]) => <div key={label} className="min-w-0">
            <dt className="text-muted text-xs font-medium">{label}</dt>
            <dd className="whitespace-pre-wrap break-words text-sm">{value}</dd>
          </div>)}
        </dl>
      </Card.Content></Card>
      <ExpenseDocuments userId={userId} expenseId={expense.id!} attachments={attachments} />
    </div>
    {editOpen ? <ExpenseFormDialog userId={userId} mode="edit" expenseData={expense} isOpen onClose={() => setEditOpen(false)} onSaved={() => router.refresh()} /> : null}
    {deleteOpen ? <DeleteExpenseModal userId={userId} expenseData={expense} isOpen onClose={() => setDeleteOpen(false)} onDeleted={() => router.push(returnTo)} /> : null}
  </section>;
}
