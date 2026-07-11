import type { FastifyRequest } from 'fastify';
import { beforeEach, vi } from 'vitest';

// Reusable mocks for external services
export const mockT = vi.fn((key: string) => key);
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const mockUseI18n = vi.fn(async (_request?: FastifyRequest) => ({
  t: mockT
}));

export const mockCloudinaryUpload = vi.fn();
export const mockCloudinaryDestroy = vi.fn();

export const mockResendSend = vi.fn().mockResolvedValue({
  data: { id: 'mock-email-id' },
  error: null
});
export const mockResendForward = vi.fn().mockResolvedValue({
  data: { id: 'mock-forwarded-email-id' },
  error: null
});

// Mock fastify-i18n
vi.mock('fastify-i18n', () => ({
  default: vi.fn(),
  useI18n: mockUseI18n,
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
      send: mockResendSend,
      receiving: {
        forward: mockResendForward
      }
    }
  }
}));

beforeEach(() => {
  vi.clearAllMocks();
});
