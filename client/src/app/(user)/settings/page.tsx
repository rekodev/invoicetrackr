import { redirect } from 'next/navigation';

import { PROFILE_PAGE } from '@/lib/constants/pages';

export default function SettingsPage() {
  redirect(PROFILE_PAGE);
}
