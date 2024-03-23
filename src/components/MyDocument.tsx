import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import React from 'react';

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'row',
    backgroundColor: '#E4E4E4',
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
});

type Props = {
  date: string;
  price: number;
};

// Create Document Component
const MyDocument = ({ date, price }: Props) => (
  <Document>
    <Page size='A4' style={styles.page}>
      <View style={styles.section}>
        <Text>PVM SĄSKAITA FAKTŪRA</Text>
      </View>
      <View style={styles.section}>
        <Text>{date}</Text>
        <Text>{price}</Text>
      </View>
    </Page>
  </Document>
);

export default MyDocument;
