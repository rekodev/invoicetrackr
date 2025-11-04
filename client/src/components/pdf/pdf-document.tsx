'use client';

import {
  Document,
  Image as PDFImage,
  Page,
  Text,
  View
} from '@react-pdf/renderer';

import { getDaysUntilDueDate, splitInvoiceId } from '@/lib/utils';
import { pdfStyles, registerPdfFont } from '@/lib/utils/pdf';
import { BankingInformationFormModel } from '@/lib/types/models/user';
import { InvoiceModel } from '@/lib/types/models/invoice';
import { amountToWords } from '@/lib/utils/amount-to-words';
import { formatDate } from '@/lib/utils/format-date';

registerPdfFont();

type Props = {
  t: any;
  invoiceData: InvoiceModel;
  senderSignatureImage: string;
  bankAccount: BankingInformationFormModel | undefined;
  currency: string;
  language: string;
};

export default function PDFDocument({
  t,
  invoiceData,
  senderSignatureImage,
  bankAccount,
  currency,
  language
}: Props) {
  const { date, dueDate, invoiceId, receiver, sender, services, totalAmount } =
    invoiceData;

  const splitId = splitInvoiceId(invoiceId);
  const series = splitId[0];
  const number = splitId[1];

  const cents = Math.floor(totalAmount * 100) % 100;

  const renderBusinessNumberLabel = (party: 'sender' | 'receiver') =>
    invoiceData?.[party]?.businessType === 'business'
      ? t('business_number_business')
      : t('business_number_individual');

  const renderHeader = () => (
    <>
      <Text style={pdfStyles.title}>
        {invoiceData?.sender?.businessType === 'business'
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
    amount: number
  ) => (
    <View style={pdfStyles.tableRow} key={index}>
      <View style={[pdfStyles.tableCol, pdfStyles.tableCol1]}>
        <Text style={pdfStyles.tableCell}>{index + 1}</Text>
      </View>
      <View style={[pdfStyles.tableCol, pdfStyles.tableCol2]}>
        <Text style={pdfStyles.tableCell}>{description}</Text>
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
    </View>
  );

  const renderTotalAmountTableRow = () => (
    <View style={pdfStyles.totalTableRow}>
      <View style={[pdfStyles.tableCol, pdfStyles.tableCol4]}>
        <Text style={pdfStyles.tableCellHeader}>{t('total_amount')}</Text>
      </View>
      <View style={[pdfStyles.tableCol, pdfStyles.tableCol5]}>
        <Text style={pdfStyles.tableCell}>
          {Number(invoiceData.totalAmount).toFixed(2)} {currency.toUpperCase()}
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
          <View style={[pdfStyles.tableColHeader, pdfStyles.tableCol2]}>
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
        </View>

        {services.map((service, index) =>
          renderTableRow(
            index,
            service.description,
            service.unit,
            service.quantity,
            service.amount
          )
        )}
      </View>

      {renderTotalAmountTableRow()}
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
            {/* TODO: Add ability for receiver to sign */}
            <Text style={pdfStyles.nameWithSubtextEmpty}>0</Text>
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
      {bankAccount?.code && bankAccount?.name && bankAccount?.accountNumber && (
        <Text style={pdfStyles.footerItem}>
          {t('bank_info_label', {
            bank_name: bankAccount?.name || '-',
            bank_code: bankAccount?.code || '-',
            bank_account_number: bankAccount?.accountNumber || '-'
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
            {totalAmount
              ? amountToWords(totalAmount, language.toLowerCase())
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
