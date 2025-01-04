import {
  Document,
  Page,
  Image as PDFImage,
  Text,
  View,
} from "@react-pdf/renderer";

import { InvoiceModel } from "@/lib/types/models/invoice";
import { BankingInformationFormModel } from "@/lib/types/models/user";
import { getDaysUntilDueDate, splitInvoiceId } from "@/lib/utils";
import { amountToWords } from "@/lib/utils/amountToWords";
import { formatDate } from "@/lib/utils/formatDate";

import styles from "./styles";
import { registerFont } from "./utils";

registerFont();

type Props = {
  t: any;
  invoiceData: InvoiceModel;
  senderSignatureImage: string;
  bankAccount: BankingInformationFormModel;
  currency: string;
  language: string;
};

const PDFDocument = ({
  t,
  invoiceData,
  senderSignatureImage,
  bankAccount,
  currency,
  language,
}: Props) => {
  const { date, dueDate, invoiceId, receiver, sender, services, totalAmount } =
    invoiceData;

  const splitId = splitInvoiceId(invoiceId);
  const series = splitId[0];
  const number = splitId[1];

  const cents = Math.floor(totalAmount * 100) % 100;

  const renderBusinessNumberLabel = (party: "sender" | "receiver") =>
    invoiceData[party].businessType === "business"
      ? t("business_number_business")
      : t("business_number_individual");

  const renderHeader = () => (
    <>
      <Text style={styles.title}>{t("title")}</Text>
      <Text style={styles.subtitle}>
        {t("series_label")} <Text style={styles.boldText}>{series}</Text>{" "}
        Nr.&nbsp;
        <Text style={styles.boldText}>{number}</Text>
      </Text>
    </>
  );

  const renderBillingDetailsSection = () => (
    <>
      <View style={styles.row}>
        <View style={styles.leftColumn}>
          <Text style={styles.detailItemTitle}>{t("provider_label")}</Text>
          <Text style={styles.detailItem}>{sender.name}</Text>
          <Text style={styles.detailItem}>
            {renderBusinessNumberLabel("sender")} {sender.businessNumber}
          </Text>
          <Text style={styles.detailItem}>
            {t("address_label")} {sender.address}
          </Text>
        </View>
        <View style={styles.rightColumn}>
          <Text style={[styles.detailItem, styles.boldText]}>
            {t("invoice_date_label")}
          </Text>
          <Text style={styles.detailItem}>{formatDate(date)}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.leftColumn}>
          <Text style={styles.detailItemTitle}>{t("payer_label")}</Text>
          <Text style={styles.detailItem}>{receiver.name}</Text>
          <Text style={styles.detailItem}>
            {renderBusinessNumberLabel("receiver")} {receiver.businessNumber}
          </Text>
          <Text style={styles.detailItem}>
            {t("address_label")} {receiver.address}
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
  ) => (
    <View style={styles.tableRow} key={index}>
      <View style={[styles.tableCol, styles.tableCol1]}>
        <Text style={styles.tableCell}>{index + 1}</Text>
      </View>
      <View style={[styles.tableCol, styles.tableCol2]}>
        <Text style={styles.tableCell}>{description}</Text>
      </View>
      <View style={[styles.tableCol, styles.tableCol3]}>
        <Text style={styles.tableCell}>{unit}</Text>
      </View>
      <View style={[styles.tableCol, styles.tableCol4]}>
        <Text style={styles.tableCell}>{quantity}</Text>
      </View>
      <View style={[styles.tableCol, styles.tableCol5]}>
        <Text style={styles.tableCell}>
          {(amount || 0).toFixed(2)} {currency.toUpperCase()}
        </Text>
      </View>
    </View>
  );

  const renderTableSection = () => (
    <View style={styles.table}>
      <View style={styles.tableRow}>
        <View style={[styles.tableColHeader, styles.tableCol1]}>
          <Text style={styles.tableCellHeader}>{t("position_label")}</Text>
        </View>
        <View style={[styles.tableColHeader, styles.tableCol2]}>
          <Text style={styles.tableCellHeader}>{t("description_label")}</Text>
        </View>
        <View style={[styles.tableColHeader, styles.tableCol3]}>
          <Text style={styles.tableCellHeader}>{t("unit_label")}</Text>
        </View>
        <View style={[styles.tableColHeader, styles.tableCol4]}>
          <Text style={styles.tableCellHeader}>{t("quantity_label")}</Text>
        </View>
        <View style={[styles.tableColHeader, styles.tableCol5]}>
          <Text style={styles.tableCellHeader}>{t("amount_label")}</Text>
        </View>
      </View>

      {services.map((service, index) =>
        renderTableRow(
          index,
          service.description,
          service.unit,
          service.quantity,
          service.amount,
        ),
      )}
    </View>
  );

  const renderSignatureSection = () => (
    <>
      <View style={styles.signatureSection}>
        <Text style={styles.signatureTitle}>
          {t("invoice_issued_by_label")}
        </Text>
        <View style={styles.signatureBox}>
          <View style={styles.signatureAndName}>
            <Text></Text>
            {senderSignatureImage && (
              <View style={styles.signatureImageContainer}>
                <PDFImage
                  style={styles.signatureImage}
                  src={senderSignatureImage}
                />
              </View>
            )}
            <Text style={styles.nameWithSubtext}>{sender.name}</Text>
          </View>
          <View style={styles.signatureLine}></View>
          <View style={styles.signatureAndName}>
            <Text style={styles.subTextSignature}>{t("signature_label")}</Text>
            <Text style={styles.subTextName}>{t("name_label")}</Text>
          </View>
        </View>
      </View>

      <View style={styles.signatureSection}>
        <Text style={styles.signatureTitle}>
          {t("invoice_received_by_label")}
        </Text>
        <View style={styles.signatureBox}>
          <View style={styles.signatureAndName}>
            <Text></Text>
            {/* TODO: Add ability for receiver to sign */}
            <Text style={styles.nameWithSubtextEmpty}>0</Text>
          </View>
          <View style={styles.signatureLine}></View>
          <View style={styles.signatureAndName}>
            <Text style={styles.subTextSignature}>{t("signature_label")}</Text>
            <Text style={styles.subTextName}>{t("name_label")}</Text>
          </View>
        </View>
      </View>
    </>
  );

  const renderFooter = () => (
    <View style={styles.footer}>
      <Text style={[styles.footerItem, styles.boldText]}>
        {t("payment_terms_label", { days: getDaysUntilDueDate(date, dueDate) })}
      </Text>
      <Text style={styles.footerItem}>
        {t("bank_info_label", {
          bank_name: bankAccount.name,
          bank_code: bankAccount.code,
          bank_account_number: bankAccount.accountNumber,
        })}
      </Text>
    </View>
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {renderHeader()}
        {renderBillingDetailsSection()}
        {renderTableSection()}
        <View style={styles.midSection}>
          <Text style={[styles.detailItem, styles.boldText]}>
            {amountToWords(totalAmount, language.toLowerCase())}{" "}
            {currency.toUpperCase()}{" "}
            {t("cents", {
              cents: String(cents).length > 1 ? cents : `0${cents}`,
            })}
          </Text>
          {renderSignatureSection()}
        </View>
        {renderFooter()}
      </Page>
    </Document>
  );
};

export default PDFDocument;
