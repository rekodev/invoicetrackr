import { StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFF",
    fontFamily: "Roboto",
    padding: 20,
  },
  title: {
    marginTop: 30,
    fontSize: 16,
    textAlign: "center",
    fontWeight: 700,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 12,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  columnHeader: {
    fontSize: 12,
    marginBottom: 5,
  },
  columnRowText: {
    fontSize: 10,
    textAlign: "left",
  },
  leftColumn: {
    flexDirection: "column",
    justifyContent: "flex-start",
    width: "50%",
  },
  rightColumn: {
    flexDirection: "column",
    justifyContent: "flex-start",
    width: "50%",
    alignItems: "flex-end",
    paddingRight: 10,
    paddingTop: 10,
  },
  footer: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    marginTop: 60,
  },
  footerItem: {
    fontSize: 10,
  },
  detailItemTitle: {
    marginTop: 12,
    fontSize: 11,
    fontWeight: 700,
  },
  detailItem: {
    fontSize: 10,
  },
  line: {
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    borderBottomStyle: "solid",
    marginTop: 2,
  },
  signature: {
    marginTop: 15,
    width: "30%",
    height: 50,
    borderTopWidth: 1,
    borderTopColor: "#000",
    borderTopStyle: "solid",
  },
  table: {
    borderStyle: "solid",
    borderColor: "#bfbfbf",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginVertical: 16,
  },
  tableRow: {
    margin: "auto",
    flexDirection: "row",
  },
  tableColHeader: {
    width: "25%",
    borderStyle: "solid",
    borderColor: "#bfbfbf",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomWidth: 0.5,
  },
  tableCol: {
    width: "25%",
    borderStyle: "solid",
    borderColor: "#bfbfbf",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableCol1: {
    width: "10%",
  },
  tableCol2: {
    width: "50%",
  },
  tableCol3: {
    width: "15%",
  },
  tableCol4: {
    width: "10%",
  },
  tableCol5: {
    width: "15%",
  },
  tableCellHeader: {
    margin: 5,
    fontSize: 12,
    fontWeight: 500,
  },
  tableCell: {
    margin: 5,
    fontSize: 10,
  },
  midSection: {
    padding: 20,
  },
  signatureSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginVertical: 16,
  },
  signatureTitle: {
    fontSize: 10,
    marginTop: 5,
  },
  signatureBox: {
    width: "40%",
    textAlign: "right",
  },
  signatureAndName: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  signatureLine: {
    width: "100%",
    borderTopWidth: 0.5,
    borderColor: "#bfbfbf",
    marginTop: 3,
  },
  subTextSignature: {
    fontSize: 8,
    marginTop: 2,
  },
  nameWithSubtext: {
    fontSize: 10,
    marginTop: 5,
  },
  nameWithSubtextEmpty: {
    fontSize: 10,
    marginTop: 5,
    color: "transparent",
  },
  subTextName: {
    fontSize: 8,
    marginTop: 2,
  },
  boldText: {
    fontWeight: 700,
  },
  signatureImageContainer: {
    left: "-20px",
    bottom: "-20px",
    width: "45%",
    position: "absolute",
  },
  signatureImage: {
    objectFit: "contain",
  },
});

export default styles;
