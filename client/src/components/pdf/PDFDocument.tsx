import { Document, Page, View, Text } from '@react-pdf/renderer';

import { InvoiceModel } from '@/types/models/invoice';
import { getDaysUntilDueDate, splitInvoiceId } from '@/utils';
import { formatDate } from '@/utils/formatDate';

import styles from './styles';
import { registerFont } from './utils';

registerFont();

type Props = {
  invoiceData: InvoiceModel;
};

const PDFDocument = ({ invoiceData }: Props) => {
  const { date, dueDate, invoiceId, receiver, sender, services, totalAmount } =
    invoiceData;

  const splitId = splitInvoiceId(invoiceId);
  const series = splitId[0];
  const number = splitId[1];

  const renderHeader = () => (
    <>
      <Text style={styles.title}>PVM SĄSKAITA FAKTŪRA</Text>
      <Text style={styles.subtitle}>
        Sąskaitos serija <Text style={styles.boldText}>{series}</Text> Nr.&nbsp;
        <Text style={styles.boldText}>{number}</Text>
      </Text>
    </>
  );

  const renderBillingDetailsSection = () => (
    <>
      <View style={styles.row}>
        <View style={styles.leftColumn}>
          <Text style={styles.detailItemTitle}>Tiekėjas:</Text>
          <Text style={styles.detailItem}>{sender.name}</Text>
          <Text style={styles.detailItem}>
            Įmonės kodas: {sender.businessNumber}
          </Text>
          <Text style={styles.detailItem}>Adresas: {sender.address}</Text>
        </View>
        <View style={styles.rightColumn}>
          <Text style={[styles.detailItem, styles.boldText]}>
            Sąskaitos išrašymo data:
          </Text>
          <Text style={styles.detailItem}>{formatDate(date)}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.leftColumn}>
          <Text style={styles.detailItemTitle}>Mokėtojas:</Text>
          <Text style={styles.detailItem}>{receiver.name}</Text>
          <Text style={styles.detailItem}>
            Įmonės kodas: {receiver.businessNumber}
          </Text>
          <Text style={styles.detailItem}>Adresas: {receiver.address}</Text>
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
        <Text style={styles.tableCell}>{amount} EUR</Text>
      </View>
    </View>
  );

  const renderTableSection = () => (
    <View style={styles.table}>
      <View style={styles.tableRow}>
        <View style={[styles.tableColHeader, styles.tableCol1]}>
          <Text style={styles.tableCellHeader}>Poz</Text>
        </View>
        <View style={[styles.tableColHeader, styles.tableCol2]}>
          <Text style={styles.tableCellHeader}>Aprašymas</Text>
        </View>
        <View style={[styles.tableColHeader, styles.tableCol3]}>
          <Text style={styles.tableCellHeader}>Mato vnt.</Text>
        </View>
        <View style={[styles.tableColHeader, styles.tableCol4]}>
          <Text style={styles.tableCellHeader}>Kiekis</Text>
        </View>
        <View style={[styles.tableColHeader, styles.tableCol5]}>
          <Text style={styles.tableCellHeader}>Suma</Text>
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
  );

  const renderSignatureSection = () => (
    <>
      <View style={styles.signatureSection}>
        <Text style={styles.signatureTitle}>Sąskaitą išrašė:</Text>
        <View style={styles.signatureBox}>
          <View style={styles.signatureAndName}>
            <Text style={styles.nameWithSubtext}>Signature</Text>
            <Text style={styles.nameWithSubtext}>John Doe</Text>
          </View>
          <View style={styles.signatureLine}></View>
          <View style={styles.signatureAndName}>
            <Text style={styles.subTextSignature}>(parašas)</Text>
            <Text style={styles.subTextName}>(vardas, pavardė)</Text>
          </View>
        </View>
      </View>

      <View style={styles.signatureSection}>
        <Text style={styles.signatureTitle}>Sąskaitą gavo:</Text>
        <View style={styles.signatureBox}>
          <View style={styles.signatureAndName}>
            <Text style={styles.nameWithSubtext}>Signature</Text>
            <Text style={styles.nameWithSubtext}>John Doe</Text>
          </View>
          <View style={styles.signatureLine}></View>
          <View style={styles.signatureAndName}>
            <Text style={styles.subTextSignature}>(parašas)</Text>
            <Text style={styles.subTextName}>(vardas, pavardė)</Text>
          </View>
        </View>
      </View>
    </>
  );

  const renderFooter = () => (
    <View style={styles.footer}>
      <Text style={[styles.footerItem, styles.boldText]}>
        Apmokėjimo sąlygos: {getDaysUntilDueDate(date, dueDate)} d.
      </Text>
      <Text style={styles.footerItem}>
        AB &quot;Swedbank&quot;, banko kodas 73000; Atsiskaitomoji sąskaita:
        LT12345678010111213
      </Text>
    </View>
  );

  return (
    <Document>
      <Page size='A4' style={styles.page}>
        {renderHeader()}
        {renderBillingDetailsSection()}
        {renderTableSection()}
        <View style={styles.midSection}>
          <Text style={[styles.detailItem, styles.boldText]}>
            {totalAmount} EUR
          </Text>
          {renderSignatureSection()}
        </View>
        {renderFooter()}
      </Page>
    </Document>
  );
};

export default PDFDocument;
