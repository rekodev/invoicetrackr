import { permanentRedirect } from 'next/navigation';

import { SETTINGS_PAGE } from '@/lib/constants/pages';

export default function LegacyProfilePage() {
  permanentRedirect(SETTINGS_PAGE);
}
