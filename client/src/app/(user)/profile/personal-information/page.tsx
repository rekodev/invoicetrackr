import { permanentRedirect } from 'next/navigation';

import { PROFILE_PAGE } from '@/lib/constants/pages';

export default function LegacyPersonalInformationPage() {
  permanentRedirect(PROFILE_PAGE);
}
