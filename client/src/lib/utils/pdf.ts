import { Font, StyleSheet } from '@react-pdf/renderer';

export const getPdfCompatibleImageSource = (source: string) => {
  try {
    const url = new URL(source);

    if (
      !url.hostname.endsWith('cloudinary.com') ||
      !url.pathname.includes('/image/upload/')
    )
      return source;

    url.pathname = url.pathname.replace(
      '/image/upload/',
      '/image/upload/f_png/'
    );
    url.pathname = /\.[^./]+$/.test(url.pathname)
      ? url.pathname.replace(/\.[^./]+$/, '.png')
      : `${url.pathname}.png`;

    return url.toString();
  } catch {
    return source;
  }
};

export const registerPdfFont = () => {
  Font.register({
    family: 'Roboto',
    fonts: [
      {
        src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf',
        fontWeight: 300
      },
      {
        src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf',
        fontWeight: 400
      },
      {
        src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf',
        fontWeight: 500
      },
      {
        src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf',
        fontWeight: 700
      }
    ]
  });
};

export const pdfStyles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFF',
    fontFamily: 'Roboto',
    padding: 20
  },
  title: {
    marginTop: 30,
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 700
  },
  subtitle: {
    marginTop: 2,
    marginBottom: 18,
    fontSize: 12,
    textAlign: 'center'
  },
  businessLogo: {
    height: 56,
    left: 20,
    objectFit: 'contain',
    position: 'absolute',
    top: 40,
    width: 56
  },
  draftWatermark: {
    position: 'absolute',
    top: '46%',
    left: 0,
    width: '100%',
    textAlign: 'center',
    transform: 'rotate(-30deg)',
    color: '#DC2626',
    opacity: 0.16,
    fontSize: 44,
    fontWeight: 700
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch'
  },
  columnHeader: {
    fontSize: 12,
    marginBottom: 5
  },
  columnRowText: {
    fontSize: 10,
    textAlign: 'left'
  },
  leftColumn: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    width: '50%'
  },
  rightColumn: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    width: '50%',
    alignItems: 'flex-end',
    paddingRight: 10
  },
  detailGroup: {
    flexDirection: 'column',
    gap: 2
  },
  detailGroupSpaced: {
    flexDirection: 'column',
    gap: 2,
    marginTop: 14
  },
  rightDetailGroup: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 2
  },
  rightDetailGroupSpaced: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 2,
    marginTop: 14
  },
  footer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    marginTop: 60
  },
  footerItem: {
    fontSize: 10
  },
  detailItemTitle: {
    fontSize: 11,
    fontWeight: 700,
    lineHeight: 1.25
  },
  detailItem: {
    fontSize: 10,
    lineHeight: 1.3
  },
  line: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    borderBottomStyle: 'solid',
    marginTop: 2
  },
  signature: {
    marginTop: 15,
    width: '30%',
    height: 50,
    borderTopWidth: 1,
    borderTopColor: '#000',
    borderTopStyle: 'solid'
  },
  table: {
    borderStyle: 'solid',
    borderColor: '#bfbfbf',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginTop: 16
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row'
  },
  totalTableRow: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    borderLeftWidth: 1,
    borderColor: '#bfbfbf'
  },
  tableColHeader: {
    width: '25%',
    borderStyle: 'solid',
    borderColor: '#bfbfbf',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomWidth: 0.5
  },
  tableCol: {
    width: '25%',
    borderStyle: 'solid',
    borderColor: '#bfbfbf',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0
  },
  tableCol1: {
    width: '7%'
  },
  tableCol2: {
    width: '33%'
  },
  tableCol3: {
    width: '10%'
  },
  tableCol4: {
    width: '10%'
  },
  tableCol5: {
    width: '15%'
  },
  tableCol6: {
    width: '10%'
  },
  tableCol7: {
    width: '15%'
  },
  tableCellHeader: {
    margin: 5,
    fontSize: 10,
    fontWeight: 500
  },
  tableCell: {
    padding: 5,
    marginVertical: 'auto',
    fontSize: 10
  },
  midSection: {
    padding: 20
  },
  signatureSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginVertical: 16
  },
  signatureTitle: {
    fontSize: 10,
    marginTop: 5
  },
  signatureBox: {
    width: '40%',
    textAlign: 'right'
  },
  signatureAndName: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%'
  },
  signatureLine: {
    width: '100%',
    borderTopWidth: 0.5,
    borderColor: '#bfbfbf',
    marginTop: 3
  },
  subTextSignature: {
    fontSize: 8,
    marginTop: 2
  },
  nameWithSubtext: {
    fontSize: 10,
    marginTop: 5
  },
  nameWithSubtextEmpty: {
    fontSize: 10,
    marginTop: 5,
    color: 'transparent'
  },
  subTextName: {
    fontSize: 8,
    marginTop: 2
  },
  boldText: {
    fontWeight: 700
  },
  signatureImageContainer: {
    left: '-20px',
    bottom: '-20px',
    width: '45%',
    position: 'absolute'
  },
  signatureImage: {
    objectFit: 'contain'
  }
});
