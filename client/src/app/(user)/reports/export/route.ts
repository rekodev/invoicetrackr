import { NextRequest, NextResponse } from 'next/server';

import { getJournalExport } from '@/api/journal';
import { auth } from '@/auth';
import { LOGIN_PAGE } from '@/lib/constants/pages';
import { isResponseError } from '@/lib/utils/error';
import {
  isJournalExportFormat,
  journalExportErrorHref,
  parseJournalQuery
} from '@/lib/utils/journal';

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.redirect(new URL(LOGIN_PAGE, request.url));
  }

  const params = request.nextUrl.searchParams;
  const format = params.get('format');
  const query = parseJournalQuery(Object.fromEntries(params));
  const failed = () =>
    NextResponse.redirect(new URL(journalExportErrorHref(query), request.url));

  if (!isJournalExportFormat(format)) return failed();

  const response = await getJournalExport(Number(session.user.id), {
    ...query,
    format
  });

  if (isResponseError(response)) return failed();

  return new NextResponse(response.data, {
    status: 200,
    headers: {
      'Content-Type': String(response.headers['content-type']),
      'Content-Disposition': String(response.headers['content-disposition']),
      'Cache-Control': 'no-store'
    }
  });
}
