import { redirect } from 'next/navigation';

import { REPORTS_JOURNAL_PAGE } from '@/lib/constants/pages';

export default function ReportsPage() {
  redirect(REPORTS_JOURNAL_PAGE);
}
