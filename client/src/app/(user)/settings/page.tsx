import { redirect } from 'next/navigation';

import { FREELANCER_PROFILE_PAGE } from '@/lib/constants/pages';

export default function SettingsPage() {
  redirect(FREELANCER_PROFILE_PAGE);
}
