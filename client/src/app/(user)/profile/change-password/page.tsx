import { permanentRedirect } from 'next/navigation';

import { CHANGE_PASSWORD_PAGE } from '@/lib/constants/pages';

export default function LegacyChangePasswordPage() {
  permanentRedirect(CHANGE_PASSWORD_PAGE);
}
