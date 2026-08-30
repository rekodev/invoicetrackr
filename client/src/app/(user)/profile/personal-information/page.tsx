import { redirect } from 'next/navigation';

import { FREELANCER_PROFILE_PAGE } from '@/lib/constants/pages';

export default function LegacyPersonalInformationPage() {
  redirect(FREELANCER_PROFILE_PAGE);
}
