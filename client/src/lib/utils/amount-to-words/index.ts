import { numberToWordsEn } from './en';
import { numberToWordsLt } from './lt';

export function amountToWords(amount: number, lang: string): string {
  const whole = Math.floor(amount);
  let wholeInWords = '';

  if (lang === 'en') {
    wholeInWords = numberToWordsEn(whole); // Call the English number-to-words function
  } else if (lang === 'lt') {
    wholeInWords = numberToWordsLt(whole); // Call the Lithuanian number-to-words function
  }

  return wholeInWords.charAt(0).toUpperCase() + wholeInWords.slice(1);
}
