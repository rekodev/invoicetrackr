import { permanentRedirect } from 'next/navigation';

import { ADD_NEW_BANK_ACCOUNT_PAGE } from '@/lib/constants/pages';

export default function LegacyAddNewBankAccountPage() {
  permanentRedirect(ADD_NEW_BANK_ACCOUNT_PAGE);
}
