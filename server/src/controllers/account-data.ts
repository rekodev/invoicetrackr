import { FastifyReply, FastifyRequest } from 'fastify';
import { useI18n } from 'fastify-i18n';

import {
  getAccountExportFromDb,
  getAccountFilesFromDb
} from '../database/account-export';
import { downloadAccountFiles } from '../services/account-storage';
import { accountExportFiles, buildAccountExportZip } from '../utils/account-data';
import { recordRequestAudit } from '../utils/audit';
import { InternalServerError, NotFoundError } from '../utils/error';

const ZIP_CONTENT_TYPE = 'application/zip';

export const exportAccountData = async (
  req: FastifyRequest<{ Params: { userId: string } }>,
  reply: FastifyReply
) => {
  const userId = Number(req.params.userId);
  const i18n = await useI18n(req);
  const [data, accountFiles] = await Promise.all([
    getAccountExportFromDb(userId),
    getAccountFilesFromDb(userId)
  ]);

  if (!data.user) throw new NotFoundError(i18n.t('error.user.notFound'));

  const exportFiles = accountExportFiles(accountFiles);
  const files = await downloadAccountFiles(exportFiles).catch((error) => {
    req.log.error({ err: error }, 'Account export failed');
    throw new InternalServerError(i18n.t('error.user.unableToExport'));
  });
  const date = new Date().toISOString().slice(0, 10);
  const zip = buildAccountExportZip({
    data,
    readme: i18n.t('accountExport.readme', { date, email: data.user.email }),
    files
  });

  await recordRequestAudit({
    req,
    userId,
    action: 'account.data_exported',
    entityType: 'account',
    entityId: userId,
    newValue: { files: files.length }
  });

  reply
    .header('Content-Type', ZIP_CONTENT_TYPE)
    .header(
      'Content-Disposition',
      `attachment; filename="${i18n.t('accountExport.filename')}-${date}.zip"`
    )
    .header('Cache-Control', 'no-store')
    .status(200)
    .send(zip);
};
