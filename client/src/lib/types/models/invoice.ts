// Re-export types from shared package for client use
export type {
  Invoice,
  InvoiceGet,
  InvoiceStatus,
  InvoiceService,
  InvoiceServiceGet,
  InvoicePartyBusinessType,
  InvoicePartyType
} from '@invoicetrackr/types';

// Client-specific type aliases for compatibility
import type { Invoice } from '@invoicetrackr/types';
export type InvoiceModel = Invoice;
export type InvoiceFormData = Invoice;

