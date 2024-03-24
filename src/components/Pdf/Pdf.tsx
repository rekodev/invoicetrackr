import { Document, Page, View, Text } from '@react-pdf/renderer';

import styles from './styles';
import { registerFont } from './utils';

registerFont();

const Pdf = () => {
  const renderHeader = () => (
    <>
      <Text style={styles.title}>PVM SĄSKAITA FAKTŪRA</Text>
      <Text style={styles.subtitle}>
        Sąskaitos serija <Text style={styles.boldText}>AAA</Text> Nr.{' '}
        <Text style={styles.boldText}>1</Text>
      </Text>
    </>
  );

  const renderBillingDetailsSection = () => (
    <>
      <View style={styles.row}>
        <View style={styles.leftColumn}>
          <Text style={styles.detailItemTitle}>Tiekėjas:</Text>
          <Text style={styles.detailItem}>UAB Pavyzdys</Text>
          <Text style={styles.detailItem}>Įmonės kodas: 123456789</Text>
          <Text style={styles.detailItem}>PVM kodas: LT123456789</Text>
          <Text style={styles.detailItem}>
            Adresas: Pavyzdžio g. 1, Vilnius
          </Text>
        </View>
        <View style={styles.rightColumn}>
          <Text style={[styles.detailItem, styles.boldText]}>
            Sąskaitos išrašymo data:
          </Text>
          <Text style={styles.detailItem}>2024 m. kovo 24 d.</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.leftColumn}>
          <Text style={styles.detailItemTitle}>Mokėtojas:</Text>
          <Text style={styles.detailItem}>UAB Pavyzdys</Text>
          <Text style={styles.detailItem}>Įmonės kodas: 123456789</Text>
          <Text style={styles.detailItem}>PVM kodas: LT123456789</Text>
          <Text style={styles.detailItem}>
            Adresas: Pavyzdžio g. 1, Vilnius
          </Text>
        </View>
      </View>
    </>
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

      <View style={styles.tableRow}>
        <View style={[styles.tableCol, styles.tableCol1]}>
          <Text style={styles.tableCell}>1</Text>
        </View>
        <View style={[styles.tableCol, styles.tableCol2]}>
          <Text style={styles.tableCell}>
            Front-end programavimo paslauga Front-end programavimo paslauga
            Front-end programavimo paslauga Front-end programavimo paslauga
            Front-end programavimo paslauga
          </Text>
        </View>
        <View style={[styles.tableCol, styles.tableCol3]}>
          <Text style={styles.tableCell}>projektas</Text>
        </View>
        <View style={[styles.tableCol, styles.tableCol4]}>
          <Text style={styles.tableCell}>1</Text>
        </View>
        <View style={[styles.tableCol, styles.tableCol5]}>
          <Text style={styles.tableCell}>800.00 EUR</Text>
        </View>
      </View>
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
        Apmokėjimo sąlygos: 7 kalendorinės dienos
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
            Aštuoni šimtai EUR 00 ct.
          </Text>
          {renderSignatureSection()}
        </View>
        {renderFooter()}
      </Page>
    </Document>
  );
};

export default Pdf;
