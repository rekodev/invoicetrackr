import type { ExpenseAttachment, ExpenseBody } from '@invoicetrackr/types';

export const expense: ExpenseBody = {
  id: 10, expenseDate: '2026-10-01', paymentDate: null, supplier: 'Telia', documentNumber: 'R-42',
  description: 'Internet service', category: 'telecommunications', currency: 'eur', totalAmount: '100.00',
  eurAmount: '100.00', vatAmount: '21.00', businessUsePercentage: '50.00', deductibleAmount: '50.00',
  paymentMethod: 'card', notes: 'For client work', createdAt: '2026-10-01T10:00:00Z', updatedAt: '2026-10-02T10:00:00Z'
};
export const attachment: ExpenseAttachment = {
  id: 3, expenseId: 10, storageProvider: 'cloudinary', resourceType: 'image', originalFileName: 'receipt.pdf',
  sanitizedFileName: 'receipt.pdf', mimeType: 'application/pdf', fileSize: 2048, checksum: 'checksum',
  malwareScanStatus: 'not_configured', uploadedAt: '2026-10-01T10:00:00Z', updatedAt: '2026-10-01T10:00:00Z'
};
