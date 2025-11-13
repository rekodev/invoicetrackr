const onesLt = [
  '',
  'vienas',
  'du',
  'trys',
  'keturi',
  'penki',
  'šeši',
  'septyni',
  'aštuoni',
  'devyni',
  'dešimt',
  'vienuolika',
  'dvylika',
  'trylika',
  'keturiolika',
  'penkiolika',
  'šešiolika',
  'septyniolika',
  'aštuoniolika',
  'devyniolika'
];

const tensLt = [
  '',
  '',
  'dvidešimt',
  'trisdešimt',
  'keturiasdešimt',
  'penkiasdešimt',
  'šešiasdešimt',
  'septyniasdešimt',
  'aštuoniasdešimt',
  'devyniasdešimt'
];

const thousandsLt = ['', 'tūkstantis', 'milijonas', 'milijardas', 'trilijonas'];

function convertHundredsLt(n: number): string {
  if (n === 0) return '';

  // Handle numbers between 1 and 19
  if (n < 20) return onesLt[n];

  if (n < 100) {
    // Handle tens (20, 30, etc.)
    return (
      tensLt[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + onesLt[n % 10] : '')
    );
  }

  // Handle hundreds (100, 200, etc.)
  const hundreds = Math.floor(n / 100);
  const remainder = n % 100;
  const hundredWord = hundreds === 1 ? 'šimtas' : 'šimtai'; // Check if it's 1, else use plural
  const hundredPrefix = hundreds === 1 ? '' : onesLt[hundreds] + ' ';

  return (
    hundredPrefix +
    hundredWord +
    (remainder !== 0 ? ' ' + convertHundredsLt(remainder) : '')
  );
}

export function numberToWordsLt(n: number): string {
  if (n === 0) return 'nulis';
  let result = '';
  let group = 0;

  while (n > 0) {
    const currentGroup = n % 1000;

    if (currentGroup !== 0) {
      let groupWords = convertHundredsLt(currentGroup);

      // Handle the pluralization of "Tūkstantis", "Milijonas", "Milijardas", etc.
      if (group === 1 && currentGroup === 1) {
        groupWords += ' tūkstantis';
      } else if (group === 1 && currentGroup !== 1) {
        groupWords += ' tūkstančiai';
      } else if (group === 2 && currentGroup === 1) {
        groupWords += ' milijonas';
      } else if (group === 2 && currentGroup !== 1) {
        groupWords += ' milijonai';
      } else if (group === 3 && currentGroup === 1) {
        groupWords += ' milijardas';
      } else if (group === 3 && currentGroup !== 1) {
        groupWords += ' milijardai';
      } else if (group === 4 && currentGroup === 1) {
        groupWords += ' trilijonas';
      } else if (group === 4 && currentGroup !== 1) {
        groupWords += ' trilijonai';
      } else {
        groupWords += thousandsLt[group] ? ' ' + thousandsLt[group] : '';
      }

      result = groupWords + ' ' + result;
    }

    n = Math.floor(n / 1000);
    group += 1;
  }

  return result.trim();
}
