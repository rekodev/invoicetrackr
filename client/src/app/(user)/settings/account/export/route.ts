import { NextRequest, NextResponse } from 'next/server';

import { getAccountDataExport } from '@/api/user';
import { auth } from '@/auth';
import { LOGIN_PAGE } from '@/lib/constants/pages';
import { accountDataExportErrorHref } from '@/lib/utils/account-data';
import { isResponseError } from '@/lib/utils/error';

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.redirect(new URL(LOGIN_PAGE, request.url));
  }

  const response = await getAccountDataExport(Number(session.user.id));

  if (isResponseError(response)) {
    return NextResponse.redirect(
      new URL(accountDataExportErrorHref, request.url)
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
