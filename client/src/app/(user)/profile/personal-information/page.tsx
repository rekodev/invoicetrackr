import { permanentRedirect } from 'next/navigation';

import { FREELANCER_PROFILE_PAGE } from '@/lib/constants/pages';

export default function LegacyPersonalInformationPage() {
  permanentRedirect(FREELANCER_PROFILE_PAGE);
}
