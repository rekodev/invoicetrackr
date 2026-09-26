const onesEn = [
  '',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Eleven',
  'Twelve',
  'Thirteen',
  'Fourteen',
  'Fifteen',
  'Sixteen',
  'Seventeen',
  'Eighteen',
  'Nineteen'
];

const tensEn = [
  '',
  '',
  'Twenty',
  'Thirty',
  'Forty',
  'Fifty',
  'Sixty',
  'Seventy',
  'Eighty',
  'Ninety'
];

const thousandsEn = ['', 'Thousand', 'Million', 'Billion', 'Trillion'];

function convertHundredsEn(n: number): string {
  if (n === 0) return '';
  if (n < 20) return onesEn[n];
  if (n < 100)
    return (
      tensEn[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + onesEn[n % 10] : '')
    );
  return (
    onesEn[Math.floor(n / 100)] +
    ' Hundred' +
    (n % 100 !== 0 ? ' ' + convertHundredsEn(n % 100) : '')
  );
}

export function numberToWordsEn(n: number): string {
  if (n === 0) return 'Zero';
  let result = '';
  let group = 0;

  while (n > 0) {
    if (n % 1000 !== 0) {
      result =
        convertHundredsEn(n % 1000) +
        (thousandsEn[group] ? ' ' + thousandsEn[group] : '') +
        ' ' +
        result;
    }
    n = Math.floor(n / 1000);
    group += 1;
  }

  return result.trim();
}
