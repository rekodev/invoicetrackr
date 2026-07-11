// @ts-nocheck
'use client';

import type { InvoiceBody, InvoiceServiceBody } from '@invoicetrackr/types';
import {
  Document,
  Image as PDFImage,
  Page,
  Text,
  View
} from '@react-pdf/renderer';

import {
  calculateInvoiceTotals,
  getDaysUntilDueDate,
  splitInvoiceId
} from '@/lib/utils';
import { amountToWords } from '@/lib/utils/amount-to-words';
import { formatDate } from '@/lib/utils/date';
import { pdfStyles, registerPdfFont } from '@/lib/utils/pdf';

registerPdfFont();

type Props = {
  t: ReturnType<typeof import('next-intl').createTranslator>;
  invoiceData: InvoiceBody;
  senderSignatureImage: string;
  receiverSignatureImage?: string;
  currency: string;
  language: string;
};

export default function PDFDocument({
  t,
  invoiceData,
  senderSignatureImage,
  receiverSignatureImage,
  currency,
  language
}: Props) {
  const { date, dueDate, invoiceId, receiver, sender, services, totalAmount } =
    invoiceData;
  const invoiceTotals = calculateInvoiceTotals(services);
  const subtotalAmount =
    invoiceData.subtotalAmount || invoiceTotals.subtotalAmount;
  const vatAmount = invoiceData.vatAmount || invoiceTotals.vatAmount;
  const grandTotalAmount = totalAmount || invoiceTotals.totalAmount;
  const shouldShowVatTotal = Number(vatAmount) > 0;
  const shouldShowVatDetails =
    shouldShowVatTotal ||
    services.some(
      (service) =>
        Number(service.vatRate ?? 0) > 0 || Boolean(service.vatExemptionReason)
    );
  const descriptionColumnStyle = pdfStyles.tableCol2;
  const lineTotalColumnStyle = shouldShowVatDetails
    ? pdfStyles.tableCol7
    : { ...pdfStyles.tableCol7, width: '25%' };

  const splitId = splitInvoiceId(invoiceId);
  const series = splitId[0];
  const number = splitId[1];

  const cents = Math.floor(Number(grandTotalAmount) * 100) % 100;

  const renderBusinessNumberLabel = (party: 'sender' | 'receiver') =>
    invoiceData?.[party]?.businessType === 'business'
      ? t('business_number_business')
      : t('business_number_individual');

  const renderHeader = () => (
    <>
      <Text style={pdfStyles.title}>
        {invoiceData?.sender?.vatNumber
          ? t('businessTitle')
          : t('individualTitle')}{' '}
      </Text>
      <Text style={pdfStyles.subtitle}>
        {t('series_label')} <Text style={pdfStyles.boldText}>{series}</Text>{' '}
        {t('invoice_number_label')}&nbsp;
        <Text style={pdfStyles.boldText}>{number}</Text>
      </Text>
    </>
  );

  const renderBillingDetailsSection = () => (
    <>
      <View style={pdfStyles.row}>
        <View style={pdfStyles.leftColumn}>
          <Text style={pdfStyles.detailItemTitle}>{t('provider_label')}</Text>
          <Text style={pdfStyles.detailItem}>{sender?.name}</Text>
          <Text style={pdfStyles.detailItem}>
            {renderBusinessNumberLabel('sender')} {sender?.businessNumber}
          </Text>
          {sender?.vatNumber && (
            <Text style={pdfStyles.detailItem}>
              {t('vat_number_label')} {sender?.vatNumber}
            </Text>
          )}
          <Text style={pdfStyles.detailItem}>
            {t('address_label')} {sender?.address}
          </Text>
        </View>
        <View style={pdfStyles.rightColumn}>
          <Text style={[pdfStyles.detailItem, pdfStyles.boldText]}>
            {t('invoice_date_label')}
          </Text>
          <Text style={pdfStyles.detailItem}>
            {date ? formatDate(date) : ''}
          </Text>
        </View>
      </View>

      <View style={pdfStyles.row}>
        <View style={pdfStyles.leftColumn}>
          <Text style={pdfStyles.detailItemTitle}>{t('payer_label')}</Text>
          <Text style={pdfStyles.detailItem}>{receiver?.name}</Text>
          <Text style={pdfStyles.detailItem}>
            {renderBusinessNumberLabel('receiver')} {receiver?.businessNumber}
          </Text>
          {receiver?.vatNumber && (
            <Text style={pdfStyles.detailItem}>
              {t('vat_number_label')} {receiver?.vatNumber}
            </Text>
          )}
          <Text style={pdfStyles.detailItem}>
            {t('address_label')} {receiver?.address}
          </Text>
        </View>
      </View>
    </>
  );

  const renderTableRow = (
    index: number,
    description: string,
    unit: string,
    quantity: number,
    amount: number,
    vatRate?: number,
    vatExemptionReason?: string
  ) => (
    <View style={pdfStyles.tableRow} key={index}>
      <View style={[pdfStyles.tableCol, pdfStyles.tableCol1]}>
        <Text style={pdfStyles.tableCell}>{index + 1}</Text>
      </View>
      <View style={[pdfStyles.tableCol, descriptionColumnStyle]}>
        <Text style={pdfStyles.tableCell}>{description}</Text>
        {vatExemptionReason && (
          <Text style={pdfStyles.tableCell}>
            {t('vat_exemption_reason_label')}: {vatExemptionReason}
          </Text>
        )}
      </View>
      <View style={[pdfStyles.tableCol, pdfStyles.tableCol3]}>
        <Text style={pdfStyles.tableCell}>{unit}</Text>
      </View>
      <View style={[pdfStyles.tableCol, pdfStyles.tableCol4]}>
        <Text style={pdfStyles.tableCell}>{quantity}</Text>
      </View>
      <View style={[pdfStyles.tableCol, pdfStyles.tableCol5]}>
        <Text style={pdfStyles.tableCell}>
          {(Number(amount) || 0).toFixed(2)} {currency.toUpperCase()}
        </Text>
      </View>
      {shouldShowVatDetails && (
        <View style={[pdfStyles.tableCol, pdfStyles.tableCol6]}>
          <Text style={pdfStyles.tableCell}>{Number(vatRate ?? 0)}%</Text>
        </View>
      )}
      <View style={[pdfStyles.tableCol, lineTotalColumnStyle]}>
        <Text style={pdfStyles.tableCell}>
          {(
            Number(amount) *
            Number(quantity) *
            (1 + Number(vatRate ?? 0) / 100)
          ).toFixed(2)}{' '}
          {currency.toUpperCase()}
        </Text>
      </View>
    </View>
  );

  const renderTotalAmountTableRow = (
    label: string,
    amount: string,
    isGrandTotal = false
  ) => (
    <View style={pdfStyles.totalTableRow}>
      <View style={[pdfStyles.tableCol, pdfStyles.tableCol4]}>
        <Text style={pdfStyles.tableCellHeader}>{label}</Text>
      </View>
      <View style={[pdfStyles.tableCol, pdfStyles.tableCol5]}>
        <Text
          style={[
            pdfStyles.tableCell,
            ...(isGrandTotal ? [pdfStyles.boldText] : [])
          ]}
        >
          {(Number(amount) || 0).toFixed(2)} {currency.toUpperCase()}
        </Text>
      </View>
    </View>
  );

  const renderTableSection = () => (
    <>
      <View style={pdfStyles.table}>
        <View style={pdfStyles.tableRow}>
          <View style={[pdfStyles.tableColHeader, pdfStyles.tableCol1]}>
            <Text style={pdfStyles.tableCellHeader}>{t('position_label')}</Text>
          </View>
          <View style={[pdfStyles.tableColHeader, descriptionColumnStyle]}>
            <Text style={pdfStyles.tableCellHeader}>
              {t('description_label')}
            </Text>
          </View>
          <View style={[pdfStyles.tableColHeader, pdfStyles.tableCol3]}>
            <Text style={pdfStyles.tableCellHeader}>{t('unit_label')}</Text>
          </View>
          <View style={[pdfStyles.tableColHeader, pdfStyles.tableCol4]}>
            <Text style={pdfStyles.tableCellHeader}>{t('quantity_label')}</Text>
          </View>
          <View style={[pdfStyles.tableColHeader, pdfStyles.tableCol5]}>
            <Text style={pdfStyles.tableCellHeader}>{t('amount_label')}</Text>
          </View>
          {shouldShowVatDetails && (
            <View style={[pdfStyles.tableColHeader, pdfStyles.tableCol6]}>
              <Text style={pdfStyles.tableCellHeader}>
                {t('vat_rate_label')}
              </Text>
            </View>
          )}
          <View style={[pdfStyles.tableColHeader, lineTotalColumnStyle]}>
            <Text style={pdfStyles.tableCellHeader}>
              {t('line_total_label')}
            </Text>
          </View>
        </View>

        {services.map((service: InvoiceServiceBody, index: number) =>
          renderTableRow(
            index,
            service.description,
            service.unit,
            service.quantity,
            service.amount,
            service.vatRate,
            service.vatExemptionReason
          )
        )}
      </View>

      {renderTotalAmountTableRow(t('subtotal_amount'), subtotalAmount)}
      {shouldShowVatTotal &&
        renderTotalAmountTableRow(t('vat_amount'), vatAmount)}
      {renderTotalAmountTableRow(t('total_amount'), grandTotalAmount, true)}
    </>
  );

  const renderSignatureSection = () => (
    <>
      <View style={pdfStyles.signatureSection}>
        <Text style={pdfStyles.signatureTitle}>
          {t('invoice_issued_by_label')}
        </Text>
        <View style={pdfStyles.signatureBox}>
          <View style={pdfStyles.signatureAndName}>
            <Text></Text>
            {senderSignatureImage && (
              <View style={pdfStyles.signatureImageContainer}>
                <PDFImage
                  style={pdfStyles.signatureImage}
                  src={senderSignatureImage}
                />
              </View>
            )}
            <Text style={pdfStyles.nameWithSubtext}>{sender?.name}</Text>
          </View>
          <View style={pdfStyles.signatureLine}></View>
          <View style={pdfStyles.signatureAndName}>
            <Text style={pdfStyles.subTextSignature}>
              {t('signature_label')}
            </Text>
            <Text style={pdfStyles.subTextName}>{t('name_label')}</Text>
          </View>
        </View>
      </View>

      <View style={pdfStyles.signatureSection}>
        <Text style={pdfStyles.signatureTitle}>
          {t('invoice_received_by_label')}
        </Text>
        <View style={pdfStyles.signatureBox}>
          <View style={pdfStyles.signatureAndName}>
            <Text></Text>
            {(receiverSignatureImage || invoiceData.receiverSignature) && (
              <View style={pdfStyles.signatureImageContainer}>
                <PDFImage
                  style={pdfStyles.signatureImage}
                  src={receiverSignatureImage || invoiceData.receiverSignature}
                />
              </View>
            )}
            <Text
              style={
                receiverSignatureImage || invoiceData.receiverSignature
                  ? pdfStyles.nameWithSubtext
                  : pdfStyles.nameWithSubtextEmpty
              }
            >
              {receiver?.name || '0'}
            </Text>
          </View>
          <View style={pdfStyles.signatureLine}></View>
          <View style={pdfStyles.signatureAndName}>
            <Text style={pdfStyles.subTextSignature}>
              {t('signature_label')}
            </Text>
            <Text style={pdfStyles.subTextName}>{t('name_label')}</Text>
          </View>
        </View>
      </View>
    </>
  );

  const renderFooter = () => (
    <View style={pdfStyles.footer}>
      <Text style={[pdfStyles.footerItem, pdfStyles.boldText]}>
        {t('payment_terms_label', {
          days: date && dueDate ? getDaysUntilDueDate(date, dueDate) : '0'
        })}
      </Text>
      {invoiceData.bankingInformation?.code &&
        invoiceData.bankingInformation?.name &&
        invoiceData.bankingInformation?.accountNumber && (
          <Text style={pdfStyles.footerItem}>
            {t('bank_info_label', {
              bank_name: invoiceData.bankingInformation?.name || '-',
              bank_code: invoiceData.bankingInformation?.code || '-',
              bank_account_number:
                invoiceData.bankingInformation?.accountNumber || '-'
            })}
          </Text>
        )}
    </View>
  );

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        {renderHeader()}
        {renderBillingDetailsSection()}
        {renderTableSection()}
        <View style={pdfStyles.midSection}>
          <Text style={[pdfStyles.detailItem, pdfStyles.boldText]}>
            {grandTotalAmount
              ? amountToWords(grandTotalAmount, language.toLowerCase())
              : '0'}{' '}
            {currency.toUpperCase()}{' '}
            {t('cents', {
              cents: isNaN(cents)
                ? '00'
                : String(cents).length > 1
                  ? cents
                  : `0${cents}`
            })}
          </Text>
          {renderSignatureSection()}
        </View>
        {renderFooter()}
      </Page>
    </Document>
  );
}
