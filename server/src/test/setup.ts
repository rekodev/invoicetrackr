import { beforeEach, vi } from 'vitest';

// Reusable mocks for external services
export const mockT = vi.fn((key: string) => key);
export const mockUseI18n = vi.fn(async () => ({ t: mockT }));

export const mockCloudinaryUpload = vi.fn();
export const mockCloudinaryDestroy = vi.fn();

export const mockResendSend = vi.fn().mockResolvedValue({
  data: { id: 'mock-email-id' },
  error: null
});

export const mockStripeCustomerCreate = vi.fn().mockResolvedValue({
  id: 'mock-customer-id'
});
export const mockStripeCustomerDelete = vi.fn().mockResolvedValue({});
export const mockStripeCustomerRetrieve = vi.fn();
export const mockStripeSubscriptionCreate = vi.fn().mockResolvedValue({
  id: 'mock-subscription-id'
});
export const mockStripeSubscriptionRetrieve = vi.fn();
export const mockStripeSubscriptionCancel = vi.fn();

// Mock fastify-i18n
vi.mock('fastify-i18n', () => ({
  default: vi.fn(),
  useI18n: vi.fn(async () => {
    return { t: (key: string) => key };
  }),
  fastifyI18n: vi.fn()
}));

// Mock Cloudinary
vi.mock('cloudinary', () => ({
  v2: {
    config: vi.fn(),
    uploader: {
      upload: mockCloudinaryUpload,
      destroy: mockCloudinaryDestroy
    }
  }
}));

// Mock Resend
vi.mock('../config/resend', () => ({
  resend: {
    emails: {
      send: mockResendSend
    }
  }
}));

// Mock Stripe
vi.mock('../config/stripe', () => ({
  stripe: {
    customers: {
      create: mockStripeCustomerCreate,
      del: mockStripeCustomerDelete,
      retrieve: mockStripeCustomerRetrieve
    },
    subscriptions: {
      create: mockStripeSubscriptionCreate,
      retrieve: mockStripeSubscriptionRetrieve,
      cancel: mockStripeSubscriptionCancel
    }
  }
}));

beforeEach(() => {
  vi.clearAllMocks();
});
