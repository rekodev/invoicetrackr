import { strFromU8, unzipSync } from 'fflate';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as accountExportDb from '../../database/account-export';
import { exportAccountDataOptions } from '../../options/user';
import { createTestApp, mockAuthMiddleware } from '../../test/app';
import { mockLocalizedI18n } from '../../test/i18n';
import {
  mockCloudinaryPrivateDownloadUrl,
  mockCreateAuditEvent
} from '../../test/setup';

vi.mock('../../database/account-export');

const exportData = {
  user: { id: 1, email: 'owner@example.com', emailVerifiedAt: null, language: 'en', analyticsConsentStatus: null, createdAt: null },
  businessProfile: null,
  bankAccounts: [],
  cryptoWallets: [],
  clients: [{ id: 4, name: 'Client UAB' }],
  invoices: [{ id: 9, invoiceId: 'SF-1', totalAmount: '100.00' }],
  invoiceServices: [],
  invoiceSenders: [],
  invoiceReceivers: [],
  invoiceBankAccounts: [],
  invoiceCryptoWallets: [],
  payments: [],
  paymentAllocations: [],
  emailDeliveries: [],
  expenses: [],
  expenseAttachments: [],
  taxProfiles: [],
  taxEstimates: [],
  taxPayments: []
} as unknown as accountExportDb.AccountExportData;

const createApp = () =>
  createTestApp((fastifyApp) => {
    fastifyApp.get('/api/users/:userId/export', {
      ...exportAccountDataOptions,
      preHandler: mockAuthMiddleware
    });
  });

describe('Account data export', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    mockLocalizedI18n();
    vi.stubGlobal('fetch', fetchMock);
    vi.mocked(accountExportDb.getAccountExportFromDb).mockResolvedValue(exportData);
    vi.mocked(accountExportDb.getAccountFilesFromDb).mockResolvedValue({
      attachments: [
        { id: 3, expenseId: 10, storageKey: 'docs/receipt', resourceType: 'image', mimeType: 'application/pdf', sanitizedFileName: 'receipt.pdf', deletedAt: null, expenseDeletedAt: null },
        { id: 4, expenseId: 11, storageKey: 'docs/removed', resourceType: 'image', mimeType: 'image/png', sanitizedFileName: 'old.png', deletedAt: '2026-01-01', expenseDeletedAt: null }
      ],
      profile: {
        logoUrl: 'https://res.cloudinary.com/demo/image/upload/v1/invoicetrackr/business-logos/1/logo.png',
        signatureUrl: 'http://169.254.169.254/latest/image/upload/signature.png'
      }
    });
    mockCloudinaryPrivateDownloadUrl.mockReturnValue('https://signed.example/receipt');
    fetchMock.mockImplementation(async (url: string) =>
      new Response(url === 'https://signed.example/receipt' ? '%PDF-receipt' : 'png-logo')
    );
  });

  afterEach(() => vi.unstubAllGlobals());

  it('returns a private ZIP with the records, a readme and the live files', async () => {
    const app = await createApp();
    const response = await app.inject({ method: 'GET', url: '/api/users/1/export' });

    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toBe('application/zip');
    expect(response.headers['cache-control']).toBe('no-store');
    expect(response.headers['content-disposition']).toMatch(
      /^attachment; filename="invoicetrackr-data-\d{4}-\d{2}-\d{2}\.zip"$/
    );

    const zip = unzipSync(new Uint8Array(response.rawPayload));
    expect(Object.keys(zip).sort()).toEqual([
      'README.txt',
      'data.json',
      'files/expenses/10/3-receipt.pdf',
      'files/logo.png'
    ]);
    expect(JSON.parse(strFromU8(zip['data.json']))).toMatchObject({
      user: { email: 'owner@example.com' },
      clients: [{ name: 'Client UAB' }],
      invoices: [{ invoiceId: 'SF-1' }]
    });
    expect(strFromU8(zip['README.txt'])).toContain('owner@example.com');
    expect(strFromU8(zip['files/expenses/10/3-receipt.pdf'])).toBe('%PDF-receipt');
    expect(fetchMock).not.toHaveBeenCalledWith(
      expect.stringContaining('169.254.169.254')
    );
    expect(mockCloudinaryPrivateDownloadUrl).toHaveBeenCalledWith('docs/receipt', 'pdf', expect.objectContaining({ type: 'authenticated', resource_type: 'image' }));
    expect(accountExportDb.getAccountExportFromDb).toHaveBeenCalledWith(1);
    expect(mockCreateAuditEvent).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'account.data_exported', userId: 1 })
    );

    await app.close();
  });

  it('fails the export instead of returning it with missing files', async () => {
    fetchMock.mockResolvedValue(new Response('gone', { status: 404 }));

    const app = await createApp();
    const response = await app.inject({ method: 'GET', url: '/api/users/1/export' });

    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body).message).toBe(
      'Unable to prepare your data export. Please try again later'
    );

    await app.close();
  });

  it('rate-limits exports per account, not per server IP', () => {
    const { keyGenerator } = (
      exportAccountDataOptions.config as {
        rateLimit: { keyGenerator: (_request: unknown) => string };
      }
    ).rateLimit;

    expect(keyGenerator({ params: { userId: '1' }, ip: '10.0.0.1' })).not.toBe(
      keyGenerator({ params: { userId: '2' }, ip: '10.0.0.1' })
    );
  });
});
