import { DEFAULT_CURRENCY, type User } from '@invoicetrackr/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  completeUserOnboarding,
  deleteUserProfilePicture,
  updateUser,
  updateUserProfilePicture
} from '@/api/user';
import { updateSessionAction } from '@/lib/actions';

import {
  completeUserOnboardingAction,
  deleteUserProfilePictureAction,
  updateUserAction,
  updateUserProfilePictureAction
} from '../user';

vi.mock('@/api/user', () => ({
  completeUserOnboarding: vi.fn(),
  deleteUserProfilePicture: vi.fn(),
  updateUserProfilePicture: vi.fn(),
  updateUser: vi.fn()
}));

vi.mock('@/lib/actions', () => ({
  updateSessionAction: vi.fn()
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn()
}));

const user: User = {
  id: 1,
  type: 'sender',
  name: 'Test Freelancer',
  businessType: 'individual',
  businessNumber: 'IV-123',
  address: 'Vilnius',
  email: 'test@example.com',
  invoiceEmail: 'invoices@example.com',
  phone: null,
  selectedBankAccountId: null,
  profilePictureUrl: '',
  currency: DEFAULT_CURRENCY,
  language: 'en',
  preferredInvoiceLanguage: 'en',
  isVatPayer: false,
  defaultInvoiceVatMode: 'no_vat',
  defaultInvoiceSeries: 'SF',
  defaultPaymentTermsDays: 30,
  onboardingCompletedAt: null
};

describe('user actions', () => {
  beforeEach(() => {
    vi.mocked(updateSessionAction).mockResolvedValue(undefined);
  });

  it('preserves translated completion errors from the API', async () => {
    vi.mocked(completeUserOnboarding).mockResolvedValue({
      data: {
        code: 'bad_request',
        errors: [],
        message:
          'Prieš baigdami nustatymą įveskite individualios veiklos duomenis.'
      }
    } as never);

    const response = await completeUserOnboardingAction({ userId: 1 });

    expect(response).toEqual({
      ok: false,
      message:
        'Prieš baigdami nustatymą įveskite individualios veiklos duomenis.',
      validationErrors: {}
    });
    expect(updateSessionAction).not.toHaveBeenCalled();
  });

  it('updates the session only after explicit onboarding completion', async () => {
    vi.mocked(completeUserOnboarding).mockResolvedValue({
      data: {
        user: { onboardingCompletedAt: '2026-07-13T10:00:00.000Z' },
        message: 'Your freelancer workspace is ready'
      }
    } as never);

    const response = await completeUserOnboardingAction({ userId: 1 });

    expect(response.ok).toBe(true);
    expect(updateSessionAction).toHaveBeenCalledWith({
      newSession: {
        isOnboarded: true,
        onboardingCompletedAt: '2026-07-13T10:00:00.000Z'
      }
    });
  });

  it('does not complete onboarding during an ordinary profile edit', async () => {
    vi.mocked(updateUser).mockResolvedValue({
      data: {
        user: { id: 1 },
        message: 'User information updated successfully'
      }
    } as never);

    const response = await updateUserAction({
      user,
      signature: undefined
    });

    expect(response.ok).toBe(true);
    expect(updateSessionAction).toHaveBeenCalledWith({
      newSession: {
        isVatPayer: false,
        vatNumber: null,
        defaultInvoiceVatMode: 'no_vat'
      }
    });
    expect(updateSessionAction).not.toHaveBeenCalledWith(
      expect.objectContaining({
        newSession: expect.objectContaining({ isOnboarded: true })
      })
    );
  });

  it('refreshes the session avatar after a business logo upload', async () => {
    vi.mocked(updateUserProfilePicture).mockResolvedValue({
      data: {
        user: {
          id: 1,
          profilePictureUrl: 'https://res.cloudinary.com/logo.png'
        },
        message: 'Business logo updated successfully'
      }
    } as never);

    const response = await updateUserProfilePictureAction({
      userId: 1,
      formData: new FormData()
    });

    expect(response.ok).toBe(true);
    expect(updateSessionAction).toHaveBeenCalledWith({
      newSession: { image: 'https://res.cloudinary.com/logo.png' }
    });
  });

  it('clears the session avatar after removing the business logo', async () => {
    vi.mocked(deleteUserProfilePicture).mockResolvedValue({
      data: {
        user: { id: 1, profilePictureUrl: '' },
        message: 'Business logo removed successfully'
      }
    } as never);

    const response = await deleteUserProfilePictureAction({ userId: 1 });

    expect(response.ok).toBe(true);
    expect(updateSessionAction).toHaveBeenCalledWith({
      newSession: { image: null }
    });
  });
});
