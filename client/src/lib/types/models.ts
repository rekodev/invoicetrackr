// Client-specific types that don't belong in shared package
import type { User, Client, Invoice, InvoicePartyBusinessType } from '@invoicetrackr/types';

// Form-specific types
export type AccountSettingsFormModel = Pick<User, 'currency' | 'language'>;

export type ChangePasswordFormModel = {
  password: string;
  newPassword: string;
  confirmedNewPassword: string;
};

export type ClientFormData = Omit<Client, 'id' | 'businessType'> & {
  businessType: InvoicePartyBusinessType | null;
};

export type InvoiceFormData = Invoice;

// Re-export commonly used types for convenience
export type {
  User,
  Client,
  Invoice,
  BankAccount,
  InvoiceStatus,
  InvoiceService,
  InvoicePartyBusinessType
} from '@invoicetrackr/types';
