import { NextRequest, NextResponse } from 'next/server';

import { getAnnualPackageExport } from '@/api/annual-package';
import { auth } from '@/auth';
import { LOGIN_PAGE } from '@/lib/constants/pages';
import { annualPackageExportErrorHref } from '@/lib/utils/annual-package';
import { isResponseError } from '@/lib/utils/error';
import { parseJournalQuery } from '@/lib/utils/journal';

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.redirect(new URL(LOGIN_PAGE, request.url));
  }

  const { year } = parseJournalQuery(
    Object.fromEntries(request.nextUrl.searchParams)
  );
  const response = await getAnnualPackageExport(Number(session.user.id), year);

  if (isResponseError(response)) {
    return NextResponse.redirect(
      new URL(annualPackageExportErrorHref(year), request.url)
    );
  }

  return new NextResponse(response.data, {
    status: 200,
    headers: {
      'Content-Type': String(response.headers['content-type']),
      'Content-Disposition': String(response.headers['content-disposition']),
      'Cache-Control': 'no-store'
    }
  });
}
