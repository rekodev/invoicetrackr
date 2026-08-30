import { permanentRedirect } from 'next/navigation';

import { ACCOUNT_SETTINGS_PAGE } from '@/lib/constants/pages';

export default function LegacyAccountSettingsPage() {
  permanentRedirect(ACCOUNT_SETTINGS_PAGE);
}
