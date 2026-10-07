import { NextRequest, NextResponse } from 'next/server';

import { getJournalExport } from '@/api/journal';
import { auth } from '@/auth';
import { isResponseError } from '@/lib/utils/error';
import { isJournalExportFormat, parseJournalQuery } from '@/lib/utils/journal';

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return new NextResponse(null, { status: 401 });
  }

  const params = request.nextUrl.searchParams;
  const format = params.get('format');

  if (!isJournalExportFormat(format)) {
    return new NextResponse(null, { status: 400 });
  }

  const response = await getJournalExport(Number(session.user.id), {
    ...parseJournalQuery({
      year: params.get('year') ?? undefined,
      month: params.get('month') ?? undefined
    }),
    format
  });

  if (isResponseError(response)) {
    return NextResponse.json(response.data, { status: response.status });
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
