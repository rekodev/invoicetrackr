import fastifyMultipart from '@fastify/multipart';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as expenseDb from '../../database/expense';
import type { SelectExpense, SelectExpenseAttachment } from '../../database/schema';
import { deleteExpenseAttachmentOptions, getExpenseAttachmentOptions, getExpenseAttachmentsOptions, getExpenseOptions, postExpenseAttachmentOptions, replaceExpenseAttachmentOptions } from '../../options/expense';
import { createTestApp, mockAuthMiddleware } from '../../test/app';
import { UnauthorizedError } from '../../utils/error';

const storage = vi.hoisted(() => ({ upload: vi.fn(), destroy: vi.fn(), signed: vi.fn() }));
vi.mock('../../database/expense');
vi.mock('cloudinary', () => ({ v2: { uploader: { upload: storage.upload, destroy: storage.destroy }, utils: { private_download_url: storage.signed } } }));

const expense: SelectExpense = {
  id: 10, userId: 1, expenseDate: '2026-10-01', paymentDate: null, supplier: 'Supplier',
  documentNumber: null, description: 'Software', category: 'software', currency: 'eur',
  totalAmount: '100.00', eurAmount: '100.00', vatAmount: null, businessUsePercentage: '50.00',
  deductibleAmount: '50.00', paymentMethod: null, notes: null, deletedAt: null, createdAt: null, updatedAt: null
};
const attachment: SelectExpenseAttachment = {
  id: 3, expenseId: 10, storageProvider: 'cloudinary', storageKey: 'old-document', secureUrl: 'https://storage/old',
  resourceType: 'image', originalFileName: 'receipt.pdf', sanitizedFileName: 'receipt.pdf', mimeType: 'application/pdf',
  fileSize: 9, checksum: 'checksum', malwareScanStatus: 'not_configured', deletedAt: null, uploadedAt: null, updatedAt: null
};
const base = '/api/1/expenses/10/attachments';
const newAttachment = { ...attachment, storageKey: 'new-document' };
const appForDocuments = () => createTestApp((app) => {
  app.register(fastifyMultipart);
  app.get('/api/:userId/expenses/:expenseId', { ...getExpenseOptions, preHandler: mockAuthMiddleware });
  app.get('/api/:userId/expenses/:expenseId/attachments', { ...getExpenseAttachmentsOptions, preHandler: mockAuthMiddleware });
  app.get('/api/:userId/expenses/:expenseId/attachments/:attachmentId', { ...getExpenseAttachmentOptions, preHandler: mockAuthMiddleware });
  app.post('/api/:userId/expenses/:expenseId/attachments', { ...postExpenseAttachmentOptions, preHandler: mockAuthMiddleware });
  app.put('/api/:userId/expenses/:expenseId/attachments/:attachmentId', { ...replaceExpenseAttachmentOptions, preHandler: mockAuthMiddleware });
  app.delete('/api/:userId/expenses/:expenseId/attachments/:attachmentId', { ...deleteExpenseAttachmentOptions, preHandler: mockAuthMiddleware });
});
const multipart = (mime = 'application/pdf', bytes = Buffer.from('%PDF-test')) => ({
  headers: { 'content-type': 'multipart/form-data; boundary=expense-test' },
  payload: Buffer.concat([
    Buffer.from(`--expense-test\r\nContent-Disposition: form-data; name="file"; filename="receipt.pdf"\r\nContent-Type: ${mime}\r\n\r\n`),
    bytes, Buffer.from('\r\n--expense-test--\r\n')
  ])
});

beforeEach(() => {
  vi.resetAllMocks();
  mockAuthMiddleware.mockResolvedValue(undefined);
  vi.mocked(expenseDb.getExpenseFromDb).mockResolvedValue(expense);
  vi.mocked(expenseDb.getExpenseAttachmentsFromDb).mockResolvedValue([attachment]);
  vi.mocked(expenseDb.getExpenseAttachmentFromDb).mockResolvedValue(attachment);
  vi.mocked(expenseDb.insertExpenseAttachmentInDb).mockResolvedValue(newAttachment);
  vi.mocked(expenseDb.replaceExpenseAttachmentInDb).mockResolvedValue(newAttachment);
  vi.mocked(expenseDb.deleteExpenseAttachmentFromDb).mockResolvedValue(attachment);
  storage.upload.mockResolvedValue({ public_id: 'new-document', secure_url: 'https://storage/new', resource_type: 'image' });
  storage.destroy.mockResolvedValue({ result: 'ok' });
  storage.signed.mockReturnValue('https://storage/signed');
});

describe('expense details and documents', () => {
  it('requires authentication before document access', async () => {
    mockAuthMiddleware.mockRejectedValue(new UnauthorizedError('Authentication required'));
    const app = await appForDocuments();
    expect((await app.inject({ method: 'GET', url: `${base}/3` })).statusCode).toBe(401);
    expect(storage.signed).not.toHaveBeenCalled();
    await app.close();
  });

  it('returns the saved fields and deduction without recalculating', async () => {
    const app = await appForDocuments();
    const response = await app.inject({ method: 'GET', url: '/api/1/expenses/10' });
    expect(response.statusCode).toBe(200);
    expect(response.json().expense).toMatchObject({ totalAmount: '100.00', businessUsePercentage: '50.00', deductibleAmount: '50.00', paymentDate: null });
    await app.close();
  });

  it('generates only an expiring download URL for authenticated assets', async () => {
    const app = await appForDocuments();
    const before = Math.floor(Date.now() / 1000);
    const response = await app.inject({ method: 'GET', url: `${base}/3` });
    expect(response.statusCode).toBe(200);
    expect(expenseDb.getExpenseAttachmentFromDb).toHaveBeenCalledWith(1, 10, 3);
    expect(response.json().attachment).toMatchObject({ downloadUrl: 'https://storage/signed' });
    expect(response.json().attachment).not.toHaveProperty('previewUrl');
    expect(storage.signed).toHaveBeenCalledOnce();
    expect(storage.signed).toHaveBeenCalledWith('old-document', 'pdf', expect.objectContaining({ type: 'authenticated', attachment: true, expires_at: expect.any(Number) }));
    expect(storage.signed.mock.calls[0][2].expires_at).toBeGreaterThanOrEqual(before + 300);
    expect(storage.signed.mock.calls[0][2].expires_at).toBeLessThanOrEqual(Math.floor(Date.now() / 1000) + 300);
    await app.close();
  });

  it('preserves raw public IDs with their extension', async () => {
    vi.mocked(expenseDb.getExpenseAttachmentFromDb).mockResolvedValue({ ...attachment, resourceType: 'raw', storageKey: 'receipt.pdf' });
    const app = await appForDocuments();
    await app.inject({ method: 'GET', url: `${base}/3` });
    expect(storage.signed).toHaveBeenCalledWith('receipt.pdf', '', expect.objectContaining({ resource_type: 'raw' }));
    await app.close();
  });

  it.each(['GET', 'POST'] as const)('rejects %s on an inaccessible or deleted expense', async (method) => {
    vi.mocked(expenseDb.getExpenseFromDb).mockResolvedValue(undefined);
    const app = await appForDocuments();
    const response = await app.inject({ method, url: base, ...(method === 'POST' ? multipart() : {}) });
    expect(response.statusCode).toBe(404);
    expect(storage.upload).not.toHaveBeenCalled();
    expect(expenseDb.getExpenseAttachmentsFromDb).not.toHaveBeenCalled();
    await app.close();
  });

  it.each(['GET', 'PUT', 'DELETE'] as const)('rejects %s on another owner’s or removed attachment', async (method) => {
    vi.mocked(expenseDb.getExpenseAttachmentFromDb).mockResolvedValue(undefined);
    vi.mocked(expenseDb.deleteExpenseAttachmentFromDb).mockResolvedValue(undefined);
    const app = await appForDocuments();
    const response = await app.inject({ method, url: `${base}/999`, ...(method === 'PUT' ? multipart() : {}) });
    expect(response.statusCode).toBe(404);
    expect(storage.signed).not.toHaveBeenCalled();
    expect(storage.upload).not.toHaveBeenCalled();
    expect(storage.destroy).not.toHaveBeenCalled();
    await app.close();
  });

  it.each(['image/jpeg', 'image/png', 'application/pdf'])('uploads %s with saved metadata', async (mime) => {
    const app = await appForDocuments();
    const response = await app.inject({ method: 'POST', url: base, ...multipart(mime) });
    expect(response.statusCode).toBe(201);
    expect(expenseDb.insertExpenseAttachmentInDb).toHaveBeenCalledWith(expect.objectContaining({ userId: 1, attachment: expect.objectContaining({ expenseId: 10, mimeType: mime, checksum: expect.stringMatching(/^[a-f0-9]{64}$/) }) }));
    await app.close();
  });

  it('rejects unsupported files before uploading', async () => {
    const app = await appForDocuments();
    const response = await app.inject({ method: 'POST', url: base, ...multipart('text/plain') });
    expect(response.statusCode).toBe(400);
    expect(storage.upload).not.toHaveBeenCalled();
    await app.close();
  });

  it('accepts 10 MB and rejects files above 10 MB', async () => {
    const app = await appForDocuments();
    const accepted = await app.inject({ method: 'POST', url: base, ...multipart('application/pdf', Buffer.alloc(10 * 1024 * 1024)) });
    expect(accepted.statusCode).toBe(201);
    storage.upload.mockClear();
    const rejected = await app.inject({ method: 'POST', url: base, ...multipart('application/pdf', Buffer.alloc(10 * 1024 * 1024 + 2)) });
    expect(rejected.statusCode).toBe(400);
    expect(rejected.json().message).toBe('error.expenseAttachment.tooLarge');
    expect(storage.upload).not.toHaveBeenCalled();
    await app.close();
  });

  it.each(['missing', 'exception'])('preserves the old file when replacement persistence fails: %s', async (failure) => {
    if (failure === 'missing') vi.mocked(expenseDb.replaceExpenseAttachmentInDb).mockResolvedValue(undefined);
    else vi.mocked(expenseDb.replaceExpenseAttachmentInDb).mockRejectedValue(new Error('DB unavailable'));
    const app = await appForDocuments();
    const response = await app.inject({ method: 'PUT', url: `${base}/3`, ...multipart() });
    expect(response.statusCode).toBe(failure === 'missing' ? 400 : 500);
    expect(storage.destroy).toHaveBeenCalledWith('new-document', expect.any(Object));
    expect(storage.destroy).not.toHaveBeenCalledWith('old-document', expect.any(Object));
    await app.close();
  });

  it('cleans up an upload when initial persistence fails', async () => {
    vi.mocked(expenseDb.insertExpenseAttachmentInDb).mockRejectedValue(new Error('DB unavailable'));
    const app = await appForDocuments();
    expect((await app.inject({ method: 'POST', url: base, ...multipart() })).statusCode).toBe(500);
    expect(storage.destroy).toHaveBeenCalledWith('new-document', expect.any(Object));
    await app.close();
  });

  it('replaces before deleting old storage and forwards the expected storage key', async () => {
    const app = await appForDocuments();
    expect((await app.inject({ method: 'PUT', url: `${base}/3`, ...multipart() })).statusCode).toBe(200);
    expect(expenseDb.replaceExpenseAttachmentInDb).toHaveBeenCalledWith(expect.objectContaining({ expectedStorageKey: 'old-document' }));
    expect(storage.destroy).toHaveBeenCalledWith('old-document', expect.any(Object));
    expect(vi.mocked(expenseDb.replaceExpenseAttachmentInDb).mock.invocationCallOrder[0]).toBeLessThan(storage.destroy.mock.invocationCallOrder[0]);
    await app.close();
  });

  it.each(['PUT', 'DELETE'] as const)('reports successful %s even when storage cleanup fails', async (method) => {
    storage.destroy.mockRejectedValue(new Error('Storage unavailable'));
    const app = await appForDocuments();
    const response = await app.inject({ method, url: `${base}/3`, ...(method === 'PUT' ? multipart() : {}) });
    expect(response.statusCode).toBe(200);
    await app.close();
  });
});
