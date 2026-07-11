import { DEFAULT_CURRENCY } from '@invoicetrackr/types';
import { Factory } from 'fishery';

import type { getUserByEmailFromDb, getUserFromDb } from '../../database/user';

type UserFromDb = NonNullable<Awaited<ReturnType<typeof getUserFromDb>>>;
type UserWithPasswordFromDb = NonNullable<
  Awaited<ReturnType<typeof getUserByEmailFromDb>>
>;

export const userFactory = Factory.define<UserFromDb>(({ sequence }) => ({
  id: sequence,
  name: `Test User ${sequence}`,
  email: `user${sequence}@example.com`,
  invoiceEmail: `invoice${sequence}@example.com`,
  phone: null,
  emailVerifiedAt: new Date().toISOString(),
  address: `${sequence} Test Street`,
  businessNumber: `BN${sequence}`,
  vatNumber: null,
  businessType: 'individual',
  type: 'sender',
  signature: `signature${sequence}.png`,
  selectedBankAccountId: null,
  profilePictureUrl: `profile${sequence}.png`,
  currency: DEFAULT_CURRENCY,
  language: 'en',
  preferredInvoiceLanguage: 'en',
  isVatPayer: false,
  defaultInvoiceVatMode: 'no_vat',
  defaultInvoiceSeries: 'SF',
  defaultPaymentTermsDays: 30,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  onboardingCompletedAt: new Date().toISOString(),
  analyticsConsentStatus: null,
  analyticsConsentUpdatedAt: null
}));

export const userWithPasswordFactory = Factory.define<UserWithPasswordFromDb>(
  ({ sequence }) => ({
    id: sequence,
    name: `Test User ${sequence}`,
    email: `user${sequence}@example.com`,
    invoiceEmail: `invoice${sequence}@example.com`,
    phone: null,
    emailVerifiedAt: new Date().toISOString(),
    address: `${sequence} Test Street`,
    businessNumber: `BN${sequence}`,
    vatNumber: null,
    businessType: 'individual',
    type: 'sender',
    signature: `signature${sequence}.png`,
    selectedBankAccountId: null,
    profilePictureUrl: `profile${sequence}.png`,
    currency: DEFAULT_CURRENCY,
    language: 'en',
    preferredInvoiceLanguage: 'en',
    isVatPayer: false,
    defaultInvoiceVatMode: 'no_vat',
    defaultInvoiceSeries: 'SF',
    defaultPaymentTermsDays: 30,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    onboardingCompletedAt: new Date().toISOString(),
    analyticsConsentStatus: null,
    analyticsConsentUpdatedAt: null,
    password: '$2b$10$hashedpassword'
  })
);
