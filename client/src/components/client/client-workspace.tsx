'use client';

import {
  ArrowDownCircleIcon,
  ClipboardDocumentIcon,
  DocumentTextIcon,
  ExclamationCircleIcon,
  EyeIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { Button, buttonVariants, Card, Chip, toast } from '@heroui/react';
import type { ClientWorkspaceResponse } from '@invoicetrackr/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';

import EmptyState from '@/components/empty-state';
import MetricCard from '@/components/ui/metric-card';
import { CLIENTS_PAGE, INVOICE_WORKSPACE_PAGE } from '@/lib/constants/pages';
import { formatLocalizedDate } from '@/lib/utils/date';
import { getInvoiceDueStatus, getInvoicePaymentStatus } from '@/lib/utils/invoice';

import ArchiveClientModal from './archive-client-modal';
import ClientFormDialog from './client-form-dialog';

type Props = { userId: number; data: ClientWorkspaceResponse };
const PAGE_SIZE = 8;
const metrics = [
  { key: 'invoicedAmount', icon: DocumentTextIcon, iconVariant: 'accent' },
  { key: 'paidAmount', icon: ArrowDownCircleIcon, iconVariant: 'success' },
  { key: 'outstandingAmount', icon: ExclamationCircleIcon, iconVariant: 'warning' }
] as const;

export default function ClientWorkspace({ userId, data }: Props) {
  const t = useTranslations('clients.workspace');
  const fieldLabel = useTranslations('clients.form_dialog.fields');
  const locale = useLocale();
  const router = useRouter();
  const { client, totals, invoices } = data;
  const [page, setPage] = useState(1);
  const [editOpen, setEditOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const createHref = `/invoices/new?clientId=${client.id}`;
  const pages = Math.ceil(invoices.length / PAGE_SIZE);
  const visible = invoices.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const copyDetails = async () => {
    const lines = [
      `${fieldLabel('name')}: ${client.name}`,
      `${fieldLabel('business_number')}: ${client.businessNumber}`,
      client.vatNumber ? `${fieldLabel('vat_number')}: ${client.vatNumber}` : null,
      `${fieldLabel('address')}: ${client.address}`,
      client.email ? `${fieldLabel('email')}: ${client.email}` : null
    ].filter(Boolean).join('\n');
    try {
      await navigator.clipboard.writeText(lines);
      toast(t('copied'), { variant: 'success' });
    } catch {
      toast(t('copy_failed'), { variant: 'danger' });
    }
  };

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-5 pb-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold">{client.name}</h1>
          <Chip variant="soft" color="accent">{t(`business_types.${client.businessType}`)}</Chip>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={createHref} className={buttonVariants({ variant: 'primary' })}>
            <PlusIcon aria-hidden="true" className="h-4 w-4" />
            {t('create_invoice')}
          </Link>
          <Button variant="secondary" onPress={() => setEditOpen(true)}>
            <PencilIcon aria-hidden="true" className="h-4 w-4" />
            {t('edit')}
          </Button>
          <Button variant="danger" onPress={() => setArchiveOpen(true)}>
            <TrashIcon aria-hidden="true" className="h-4 w-4" />
            {t('archive')}
          </Button>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        {metrics.map(({ key, icon: Icon, iconVariant }) => (
          <MetricCard
            key={key}
            icon={<Icon className="h-4 w-4" />}
            iconVariant={iconVariant}
            title={t(`totals.${key}`)}
            text={`€${totals[key]}`}
          />
        ))}
      </div>

      <Card className="border">
        <Card.Header className="flex-row flex-wrap items-center justify-between gap-4">
          <h2 className="text-base font-medium">{t('details')}</h2>
          <Button variant="secondary" onPress={copyDetails}>
            <ClipboardDocumentIcon aria-hidden="true" className="h-4 w-4" />
            {t('copy_details')}
          </Button>
        </Card.Header>
        <Card.Content className="p-2">
          <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
            <div>
              <dt className="text-muted text-xs font-medium">{fieldLabel('business_number')}</dt>
              <dd className="text-sm break-words">{client.businessNumber}</dd>
            </div>
            {client.vatNumber ? (
              <div>
                <dt className="text-muted text-xs font-medium">{fieldLabel('vat_number')}</dt>
                <dd className="text-sm break-words">{client.vatNumber}</dd>
              </div>
            ) : null}
            <div>
              <dt className="text-muted text-xs font-medium">{fieldLabel('address')}</dt>
              <dd className="text-sm break-words">{client.address}</dd>
            </div>
            {client.email ? (
              <div>
                <dt className="text-muted text-xs font-medium">{fieldLabel('email')}</dt>
                <dd className="text-sm break-all">
                  <a href={`mailto:${client.email}`} className="hover:underline">{client.email}</a>
                </dd>
              </div>
            ) : null}
          </dl>
        </Card.Content>
      </Card>

      <Card className="min-w-0 border">
        <Card.Content>
          <h2 className="mb-3 text-base font-medium">{t('history')}</h2>
          {invoices.length === 0 ? (
            <EmptyState
              title={t('empty_title')}
              description={t('empty_description')}
              action={
                <Link href={createHref} className={buttonVariants({ variant: 'secondary', size: 'sm' })}>
                  <PlusIcon aria-hidden="true" className="h-4 w-4" />
                  {t('create_invoice')}
                </Link>
              }
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="text-muted border-b">
                    <tr>
                      <th scope="col" className="p-2 font-medium">{t('columns.number')}</th>
                      <th scope="col" className="p-2 font-medium">{t('columns.date')}</th>
                      <th scope="col" className="p-2 font-medium">{t('columns.total')}</th>
                      <th scope="col" className="p-2 font-medium">{t('columns.received')}</th>
                      <th scope="col" className="p-2 font-medium">{t('columns.outstanding')}</th>
                      <th scope="col" className="p-2 font-medium">{t('columns.state')}</th>
                      <th scope="col" className="p-2 font-medium">{t('columns.action')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((invoice) => {
                      const state = getInvoicePaymentStatus(invoice);
                      const overdue = getInvoiceDueStatus(invoice).isPastDue;
                      return (
                        <tr key={invoice.id} className="border-b last:border-0">
                          <td className="p-2 font-medium">{invoice.invoiceId || t('states.draft')}</td>
                          <td className="p-2">{formatLocalizedDate(invoice.date, locale)}</td>
                          <td className="p-2 tabular-nums">€{invoice.totalAmount}</td>
                          <td className="p-2 tabular-nums">{invoice.paidAmount === null ? '—' : `€${invoice.paidAmount}`}</td>
                          <td className="p-2 tabular-nums">{invoice.outstandingAmount === null ? '—' : `€${invoice.outstandingAmount}`}</td>
                          <td className="p-2"><div className="flex flex-wrap gap-1">
                            <Chip variant="soft" color={state === 'voided' ? 'danger' : state === 'paid' ? 'success' : 'accent'}>{t(`states.${state}`)}</Chip>
                            {overdue ? <Chip variant="soft" color="danger">{t('states.overdue')}</Chip> : null}
                          </div></td>
                          <td className="p-2 text-right">
                            <Link
                              href={INVOICE_WORKSPACE_PAGE(invoice.id)}
                              className={buttonVariants({ variant: 'secondary', size: 'sm' })}
                            >
                              <EyeIcon aria-hidden="true" className="h-4 w-4" />
                              {t('view')}
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {pages > 1 ? (
                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className="text-muted text-sm">{t('page', { page, pages })}</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" isDisabled={page === 1} onPress={() => setPage((value) => value - 1)}>{t('previous')}</Button>
                    <Button size="sm" variant="secondary" isDisabled={page === pages} onPress={() => setPage((value) => value + 1)}>{t('next')}</Button>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </Card.Content>
      </Card>

      <ClientFormDialog userId={userId} isOpen={editOpen} mode="edit" clientData={client}
        onClose={() => { setEditOpen(false); router.refresh(); }} />
      <ArchiveClientModal userId={userId} isOpen={archiveOpen} clientData={client}
        onClose={() => setArchiveOpen(false)} onArchived={() => router.push(CLIENTS_PAGE)} />
    </section>
  );
}
