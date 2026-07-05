import { Factory } from 'fishery';
import { SelectUser } from '../../database/schema';

export const userFactory = Factory.define<
  Omit<SelectUser, 'password'> & {
    stripeCustomerId: string | null;
    stripeSubscriptionId: string | null;
  }
>(({ sequence }) => ({
  id: sequence,
  name: `Test User ${sequence}`,
  email: `user${sequence}@example.com`,
  emailVerifiedAt: new Date().toISOString(),
  address: `${sequence} Test Street`,
  businessNumber: `BN${sequence}`,
  vatNumber: null,
  businessType: 'individual',
  type: 'sender',
  signature: `signature${sequence}.png`,
  selectedBankAccountId: null,
  profilePictureUrl: `profile${sequence}.png`,
  currency: 'USD',
  language: 'en',
  preferredInvoiceLanguage: 'en',
  isVatPayer: false,
  defaultInvoiceVatMode: 'no_vat',
  defaultInvoiceSeries: 'SF',
  defaultPaymentTermsDays: 30,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  stripeCustomerId: `cus_${sequence}`,
  stripeSubscriptionId: `sub_${sequence}`,
  subscriptionStatus: 'active',
  onboardingCompletedAt: new Date().toISOString(),
  trialStartedAt: null,
  trialEndsAt: null,
  subscriptionGraceEndsAt: null,
  subscriptionCurrentPeriodEndsAt: null,
  subscriptionCancelAt: null,
  analyticsConsentStatus: null,
  analyticsConsentUpdatedAt: null,
  paymentSuccessPending: false
}));

export const userWithPasswordFactory = Factory.define<
  SelectUser & {
    stripeCustomerId: string | null;
    stripeSubscriptionId: string | null;
  }
>(({ sequence }) => ({
  ...userFactory.build({ id: sequence }),
  password: '$2b$10$hashedpassword'
}));
