import { Card, Chip } from '@heroui/react';
import type { JournalRow, JournalTotals } from '@invoicetrackr/types';
import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';

import {
  EXPENSE_WORKSPACE_PAGE,
  INVOICE_WORKSPACE_PAGE
} from '@/lib/constants/pages';
import { formatMoney } from '@/lib/utils/currency';
import { formatLocalizedDate } from '@/lib/utils/date';

type Props = {
  rows: JournalRow[];
  totals: JournalTotals;
  actions: ReactNode;
};

const cell = 'px-2 py-1.5';
const amountCell = `${cell} text-right tabular-nums`;
const footerAmountCell = 'px-2 py-2 text-right tabular-nums';
const COLUMNS = [
  ['date', cell],
  ['document', cell],
  ['type', cell],
  ['description', cell],
  ['income', amountCell],
  ['vat', amountCell],
  ['expenses', amountCell]
] as const;

const JournalTable = async ({ rows, totals, actions }: Props) => {
  const t = await getTranslations('reports.journal');
  const locale = await getLocale();
  const money = (amount: string) => formatMoney(amount, locale);
  const percentage = new Intl.NumberFormat(locale, { maximumFractionDigits: 2 });

  return (
    <Card className="min-w-0 border">
      <Card.Header className="flex-row flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-base font-medium">
            {t('table.title', { count: rows.length })}
          </h2>
          <p className="text-muted text-sm">{t('table.subtitle')}</p>
        </div>
        {actions}
      </Card.Header>
      <Card.Content className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="text-muted border-b">
            <tr>
              {COLUMNS.map(([key, className]) => (
                <th key={key} scope="col" className={`${className} font-medium`}>
                  {t(`table.columns.${key}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const isIncome = row.kind === 'income';
              const documentLabel = row.documentNumber || t('table.no_document');

              return (
                <tr
                  key={isIncome ? `income-${row.paymentId}-${row.invoiceId}` : `expense-${row.expenseId}`}
                  className="border-b align-top last:border-0"
                >
                  <td className={`${cell} whitespace-nowrap tabular-nums`}>
                    {formatLocalizedDate(row.date, locale)}
                  </td>
                  <td className={`${cell} whitespace-nowrap`}>
                    <Link
                      href={isIncome ? INVOICE_WORKSPACE_PAGE(row.invoiceId) : EXPENSE_WORKSPACE_PAGE(row.expenseId)}
                      aria-label={
                        isIncome
                          ? t('a11y.open_invoice', { number: documentLabel })
                          : t('a11y.open_expense', { supplier: row.counterparty })
                      }
                      className="hover:underline"
                    >
                      {documentLabel}
                    </Link>
                  </td>
                  <td className={cell}>
                    <Chip variant="soft" color={isIncome ? 'success' : 'accent'}>
                      {t(`table.type.${row.kind}`)}
                    </Chip>
                  </td>
                  <td className={cell}>
                    <p className="font-medium">{row.counterparty}</p>
                    <p className="text-muted">{row.description}</p>
                    {!isIncome && Number(row.businessUsePercentage) < 100 && (
                      <p className="text-muted text-xs">
                        {t('table.business_use', {
                          percentage: percentage.format(Number(row.businessUsePercentage)),
                          amount: money(row.totalEurAmount)
                        })}
                      </p>
                    )}
                  </td>
                  <td className={amountCell}>{isIncome ? money(row.amount) : ''}</td>
                  <td className={amountCell}>{isIncome ? money(row.vatAmount) : ''}</td>
                  <td className={amountCell}>{isIncome ? '' : money(row.amount)}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="bg-default border-t font-semibold">
            <tr>
              <th scope="row" colSpan={4} className="px-2 py-2">{t('table.total')}</th>
              <td className={footerAmountCell}>{money(totals.income)}</td>
              <td className={footerAmountCell}>{money(totals.incomeVat)}</td>
              <td className={footerAmountCell}>{money(totals.expenses)}</td>
            </tr>
          </tfoot>
        </table>
      </Card.Content>
    </Card>
  );
};

export default JournalTable;
