import fastifyMultipart from '@fastify/multipart';
import { DEFAULT_CURRENCY } from '@invoicetrackr/types';
import bcrypt from 'bcryptjs';
import { describe, expect, it, vi } from 'vitest';

import * as accountExportDb from '../../database/account-export';
import * as emailVerificationDb from '../../database/email-verification';
import * as userDb from '../../database/user';
import {
  deleteUserOptions,
  deleteUserProfilePictureOptions,
  postOAuthUserOptions,
  updateUserLanguageOptions,
  updateUserOptions,
  updateUserProfilePictureOptions
} from '../../options/user';
import { createTestApp, mockAuthMiddleware } from '../../test/app';
import {
  userFactory,
  userWithPasswordFactory
} from '../../test/factories/user';
import {
  mockCloudinaryDeleteByPrefix,
  mockCloudinaryDestroy,
  mockCloudinaryUpload,
  mockResendSend,
  mockUseI18n
} from '../../test/setup';
import * as userController from '../user';

vi.mock('../../database/user');
vi.mock('../../database/email-verification');
vi.mock('../../database/account-export');
vi.mock('bcryptjs');

describe('User Controller', () => {
  const testUserId = 1;
  const mockUser = userFactory.build({
    id: testUserId,
    email: 'test@example.com'
  });
  const mockUserWithPassword = userWithPasswordFactory.build({
    id: testUserId,
    email: 'test@example.com'
  });

  describe('GET /api/:userId', () => {
    it('should return user data', async () => {
      vi.mocked(userDb.getUserFromDb).mockResolvedValue(mockUser);

      const { getUser } = userController;

      const app = await createTestApp((fastifyApp) => {
        fastifyApp.get(
          '/api/:userId',
          {
            preHandler: mockAuthMiddleware
          },
          getUser
        );
      });

      const response = await app.inject({
        method: 'GET',
        url: `/api/${testUserId}`
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.user).toBeDefined();
      expect(body.user.id).toBe(testUserId);
      expect(userDb.getUserFromDb).toHaveBeenCalledWith(testUserId);

      await app.close();
    });

    it('should return 400 when user not found', async () => {
      vi.mocked(userDb.getUserFromDb).mockResolvedValue(undefined);

      const { getUser } = userController;

      const app = await createTestApp((fastifyApp) => {
        fastifyApp.get(
          '/api/:userId',
          {
            preHandler: mockAuthMiddleware
          },
          getUser
        );
      });

      const response = await app.inject({
        method: 'GET',
        url: `/api/${testUserId}`
      });

      expect(response.statusCode).toBe(400);

      await app.close();
    });
  });

  describe('POST /api/login', () => {
    it('should login user with valid credentials', async () => {
      vi.mocked(userDb.getUserByEmailFromDb).mockResolvedValue(
        mockUserWithPassword
      );
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      const { loginUser } = userController;

      const app = await createTestApp((fastifyApp) => {
        fastifyApp.post('/api/login', loginUser);
      });

      const response = await app.inject({
        method: 'POST',
        url: '/api/login',
        payload: {
          email: 'test@example.com',
          password: 'password123'
        }
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.user).toBeDefined();
      expect(body.user.email).toBe('test@example.com');

      await app.close();
    });

    it('should return 401 when user not found', async () => {
      vi.mocked(userDb.getUserByEmailFromDb).mockResolvedValue(undefined);

      const { loginUser } = userController;

      const app = await createTestApp((fastifyApp) => {
        fastifyApp.post('/api/login', loginUser);
      });

      const response = await app.inject({
        method: 'POST',
        url: '/api/login',
        payload: {
          email: 'nonexistent@example.com',
          password: 'password123'
        }
      });

      expect(response.statusCode).toBe(401);

      await app.close();
    });

    it('should return 401 when password is invalid', async () => {
      vi.mocked(userDb.getUserByEmailFromDb).mockResolvedValue(
        mockUserWithPassword
      );
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      const { loginUser } = userController;

      const app = await createTestApp((fastifyApp) => {
        fastifyApp.post('/api/login', loginUser);
      });

      const response = await app.inject({
        method: 'POST',
        url: '/api/login',
        payload: {
          email: 'test@example.com',
          password: 'wrongpassword'
        }
      });

      expect(response.statusCode).toBe(401);

      await app.close();
    });
  });

  describe('POST /api/register', () => {
    it('should register a new user', async () => {
      vi.mocked(userDb.getUserByEmailFromDb).mockResolvedValue(undefined);
      vi.mocked(bcrypt.hash).mockResolvedValue('hashedPassword' as never);
      vi.mocked(userDb.registerUser).mockResolvedValue({
        id: testUserId,
        email: mockUser.email
      });

      const { postUser } = userController;

      const app = await createTestApp((fastifyApp) => {
        fastifyApp.post('/api/register', postUser);
      });

      const response = await app.inject({
        method: 'POST',
        url: '/api/register',
        payload: {
          email: 'newuser@example.com',
          password: 'password123',
          confirmedPassword: 'password123'
        }
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.email).toBeDefined();
      expect(body.message).toBeDefined();
      expect(
        emailVerificationDb.saveEmailVerificationTokenToDb
      ).toHaveBeenCalledWith(
        testUserId,
        expect.any(String),
        expect.any(String)
      );
      expect(mockResendSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: ['newuser@example.com']
        })
      );

      await app.close();
    });

    it('should return 400 when passwords do not match', async () => {
      const { postUser } = userController;

      const app = await createTestApp((fastifyApp) => {
        fastifyApp.post('/api/register', postUser);
      });

      const response = await app.inject({
        method: 'POST',
        url: '/api/register',
        payload: {
          email: 'newuser@example.com',
          password: 'password123',
          confirmedPassword: 'different123'
        }
      });

      expect(response.statusCode).toBe(400);

      await app.close();
    });

    it('should return 400 when user already exists', async () => {
      vi.mocked(userDb.getUserByEmailFromDb).mockResolvedValue(
        mockUserWithPassword
      );

      const { postUser } = userController;

      const app = await createTestApp((fastifyApp) => {
        fastifyApp.post('/api/register', postUser);
      });

      const response = await app.inject({
        method: 'POST',
        url: '/api/register',
        payload: {
          email: 'test@example.com',
          password: 'password123',
          confirmedPassword: 'password123'
        }
      });

      expect(response.statusCode).toBe(400);

      await app.close();
    });
  });

  describe('POST /api/oauth/google', () => {
    it('only accepts Google profiles from the Next.js server', async () => {
      vi.stubEnv('INTERNAL_API_SECRET', 'internal-secret');
      vi.mocked(userDb.getUserByEmailFromDb).mockResolvedValue(
        mockUserWithPassword
      );
      vi.mocked(userDb.getUserFromDb).mockResolvedValue(mockUser);

      const app = await createTestApp((fastifyApp) => {
        fastifyApp.post('/api/users/oauth/google', postOAuthUserOptions);
      });
      const payload = {
        email: 'test@example.com',
        provider: 'google',
        emailVerified: true
      };

      const publicResponse = await app.inject({
        method: 'POST',
        url: '/api/users/oauth/google',
        payload
      });

      expect(publicResponse.statusCode).toBe(401);
      expect(userDb.getUserByEmailFromDb).not.toHaveBeenCalled();

      const internalResponse = await app.inject({
        method: 'POST',
        url: '/api/users/oauth/google',
        headers: { 'x-internal-api-secret': 'internal-secret' },
        payload
      });

      expect(internalResponse.statusCode).toBe(200);
      expect(internalResponse.json().user.email).toBe(mockUser.email);

      await app.close();
    });

    it('should create a verified user from a verified Google profile', async () => {
      vi.mocked(userDb.getUserByEmailFromDb).mockResolvedValue(undefined);
      vi.mocked(bcrypt.hash).mockResolvedValue('generatedHash' as never);
      vi.mocked(userDb.registerUser).mockResolvedValue({
        id: testUserId,
        email: mockUser.email
      });
      vi.mocked(userDb.getUserFromDb).mockResolvedValue(mockUser);

      const { postOAuthUser } = userController;

      const app = await createTestApp((fastifyApp) => {
        fastifyApp.post('/api/oauth/google', postOAuthUser);
      });

      const response = await app.inject({
        method: 'POST',
        url: '/api/oauth/google',
        payload: {
          email: 'test@example.com',
          name: 'Test User',
          image: 'https://example.com/avatar.png',
          provider: 'google',
          emailVerified: true
        }
      });

      expect(response.statusCode).toBe(201);
      expect(userDb.registerUser).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          name: 'Test User',
          emailVerifiedAt: expect.any(String)
        })
      );
      expect(userDb.registerUser).not.toHaveBeenCalledWith(
        expect.objectContaining({
          profilePictureUrl: 'https://example.com/avatar.png'
        })
      );
      expect(userDb.getUserFromDb).toHaveBeenCalledWith(testUserId);

      await app.close();
    });

    it('should link an existing password account by verified Google email', async () => {
      vi.mocked(userDb.getUserByEmailFromDb).mockResolvedValue({
        ...mockUserWithPassword,
        emailVerifiedAt: null
      });
      vi.mocked(userDb.verifyUserEmailInDb).mockResolvedValue({
        id: testUserId,
        emailVerifiedAt: new Date().toISOString()
      });
      vi.mocked(userDb.getUserFromDb).mockResolvedValue(mockUser);

      const { postOAuthUser } = userController;

      const app = await createTestApp((fastifyApp) => {
        fastifyApp.post('/api/oauth/google', postOAuthUser);
      });

      const response = await app.inject({
        method: 'POST',
        url: '/api/oauth/google',
        payload: {
          email: 'test@example.com',
          provider: 'google',
          emailVerified: true
        }
      });

      expect(response.statusCode).toBe(200);
      expect(userDb.verifyUserEmailInDb).toHaveBeenCalledWith(testUserId);
      expect(userDb.registerUser).not.toHaveBeenCalled();

      await app.close();
    });

    it('should reject unverified Google email profiles', async () => {
      const { postOAuthUser } = userController;

      const app = await createTestApp((fastifyApp) => {
        fastifyApp.post('/api/oauth/google', postOAuthUser);
      });

      const response = await app.inject({
        method: 'POST',
        url: '/api/oauth/google',
        payload: {
          email: 'test@example.com',
          provider: 'google',
          emailVerified: false
        }
      });

      expect(response.statusCode).toBe(401);
      expect(userDb.registerUser).not.toHaveBeenCalled();

      await app.close();
    });
  });

  describe('POST /api/email-verification/:token', () => {
    it('should verify user email with a valid token', async () => {
      const token = 'valid-token';
      vi.mocked(
        emailVerificationDb.getEmailVerificationTokenFromDb
      ).mockResolvedValue({
        id: 1,
        userId: testUserId,
        token,
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
        usedAt: null,
        lastSentAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      });
      vi.mocked(userDb.getUserEmailVerificationStatusFromDb).mockResolvedValue({
        id: testUserId,
        email: mockUser.email,
        emailVerifiedAt: null,
        language: 'en'
      });
      vi.mocked(userDb.verifyUserEmailInDb).mockResolvedValue({
        id: testUserId,
        emailVerifiedAt: new Date().toISOString()
      });
      vi.mocked(
        emailVerificationDb.markEmailVerificationTokenUsedInDb
      ).mockResolvedValue(1);

      const { verifyUserEmail } = userController;

      const app = await createTestApp((fastifyApp) => {
        fastifyApp.post('/api/email-verification/:token', verifyUserEmail);
      });

      const response = await app.inject({
        method: 'POST',
        url: `/api/email-verification/${token}`
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.status).toBe('verified');
      expect(userDb.verifyUserEmailInDb).toHaveBeenCalledWith(testUserId);
      expect(
        emailVerificationDb.markEmailVerificationTokenUsedInDb
      ).toHaveBeenCalledWith(token);

      await app.close();
    });
  });

  describe('POST /api/:userId/email-verification/resend', () => {
    it('should reject resend requests during cooldown', async () => {
      vi.mocked(userDb.getUserEmailVerificationStatusFromDb).mockResolvedValue({
        id: testUserId,
        email: mockUser.email,
        emailVerifiedAt: null,
        language: 'en'
      });
      vi.mocked(
        emailVerificationDb.getLatestEmailVerificationTokenForUserFromDb
      ).mockResolvedValue({
        id: 1,
        userId: testUserId,
        token: 'recent-token',
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
        usedAt: null,
        lastSentAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      });

      const { resendUserVerificationEmail } = userController;

      const app = await createTestApp((fastifyApp) => {
        fastifyApp.post(
          '/api/:userId/email-verification/resend',
          {
            preHandler: mockAuthMiddleware
          },
          resendUserVerificationEmail
        );
      });

      const response = await app.inject({
        method: 'POST',
        url: `/api/${testUserId}/email-verification/resend`
      });

      expect(response.statusCode).toBe(400);
      expect(mockResendSend).not.toHaveBeenCalled();

      await app.close();
    });
  });

  describe('DELETE /api/:userId', () => {
    const createDeleteApp = () =>
      createTestApp((fastifyApp) => {
        fastifyApp.delete('/api/:userId', {
          ...deleteUserOptions,
          preHandler: mockAuthMiddleware
        });
      });

    it('rejects a confirmation email that does not match the account', async () => {
      vi.mocked(userDb.getUserFromDb).mockResolvedValue(mockUser);

      const app = await createDeleteApp();
      const response = await app.inject({
        method: 'DELETE',
        url: `/api/${testUserId}`,
        payload: { confirmEmail: 'someone@example.com' }
      });

      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.body).message).toBe(
        'error.user.deleteConfirmEmailMismatch'
      );
      expect(userDb.deleteUserFromDb).not.toHaveBeenCalled();

      await app.close();
    });

    it('deletes the account, then removes its attachments and per-user folders', async () => {
      vi.mocked(userDb.getUserFromDb).mockResolvedValue(mockUser);
      vi.mocked(userDb.deleteUserFromDb).mockResolvedValue({ id: testUserId });
      vi.mocked(accountExportDb.getAccountFilesFromDb).mockResolvedValue({
        attachments: [
          {
            id: 3,
            expenseId: 10,
            storageKey: 'invoicetrackr/expense-documents/1/10/receipt.pdf',
            resourceType: 'raw',
            mimeType: 'application/pdf',
            sanitizedFileName: 'receipt.pdf',
            deletedAt: null,
            expenseDeletedAt: null
          }
        ],
        profile: {
          logoUrl:
            'https://res.cloudinary.com/demo/image/upload/v1/invoicetrackr/business-logos/1/logo.png',
          signatureUrl:
            'https://res.cloudinary.com/demo/image/upload/v1/invoicetrackr/signatures/1/mine.png'
        }
      });
      mockCloudinaryDestroy.mockResolvedValue({ result: 'ok' });

      const app = await createDeleteApp();
      const response = await app.inject({
        method: 'DELETE',
        url: `/api/${testUserId}`,
        payload: { confirmEmail: ' TEST@example.com ' }
      });

      expect(response.statusCode).toBe(200);
      expect(userDb.deleteUserFromDb).toHaveBeenCalledWith(testUserId);
      expect(mockCloudinaryDestroy.mock.calls).toEqual([
        [
          'invoicetrackr/expense-documents/1/10/receipt.pdf',
          { resource_type: 'raw', type: 'authenticated' }
        ]
      ]);
      expect(mockCloudinaryDeleteByPrefix.mock.calls).toEqual([
        ['invoicetrackr/business-logos/1/'],
        ['invoicetrackr/signatures/1/']
      ]);
      expect(
        vi.mocked(userDb.deleteUserFromDb).mock.invocationCallOrder[0]
      ).toBeLessThan(mockCloudinaryDestroy.mock.invocationCallOrder[0]);

      await app.close();
    });
  });

  describe('POST /api/:userId/onboarding/complete', () => {
    it('completes onboarding when required details and defaults are valid', async () => {
      vi.mocked(userDb.getUserFromDb).mockResolvedValue({
        ...mockUser,
        selectedBankAccountId: null,
        onboardingCompletedAt: null
      });
      vi.mocked(userDb.completeUserOnboardingInDb).mockResolvedValue({
        onboardingCompletedAt: '2026-07-13T10:00:00.000Z'
      });

      const app = await createTestApp((fastifyApp) => {
        fastifyApp.post(
          '/api/:userId/onboarding/complete',
          { preHandler: mockAuthMiddleware },
          userController.completeUserOnboarding
        );
      });

      const response = await app.inject({
        method: 'POST',
        url: `/api/${testUserId}/onboarding/complete`
      });

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body).user.onboardingCompletedAt).toBe(
        '2026-07-13T10:00:00.000Z'
      );
      expect(userDb.completeUserOnboardingInDb).toHaveBeenCalledWith(
        testUserId
      );

      await app.close();
    });

    it('rejects an incomplete freelancer profile without recording completion', async () => {
      mockUseI18n.mockResolvedValueOnce({
        t: (key: string) =>
          key === 'error.user.onboardingProfileIncomplete'
            ? 'Add your legal name, individual activity certificate number, address, and invoice email before finishing setup.'
            : key
      } as never);
      vi.mocked(userDb.getUserFromDb).mockResolvedValue({
        ...mockUser,
        businessNumber: '',
        onboardingCompletedAt: null
      });

      const app = await createTestApp((fastifyApp) => {
        fastifyApp.post(
          '/api/:userId/onboarding/complete',
          { preHandler: mockAuthMiddleware },
          userController.completeUserOnboarding
        );
      });

      const response = await app.inject({
        method: 'POST',
        url: `/api/${testUserId}/onboarding/complete`,
        headers: { 'accept-language': 'en' }
      });

      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.body).message).toContain(
        'individual activity certificate number'
      );
      expect(userDb.completeUserOnboardingInDb).not.toHaveBeenCalled();

      await app.close();
    });

    it('allows completion without a bank account', async () => {
      vi.mocked(userDb.getUserFromDb).mockResolvedValue({
        ...mockUser,
        selectedBankAccountId: null,
        onboardingCompletedAt: null
      });
      vi.mocked(userDb.completeUserOnboardingInDb).mockResolvedValue({
        onboardingCompletedAt: '2026-07-13T10:00:00.000Z'
      });

      const app = await createTestApp((fastifyApp) => {
        fastifyApp.post(
          '/api/:userId/onboarding/complete',
          { preHandler: mockAuthMiddleware },
          userController.completeUserOnboarding
        );
      });

      const response = await app.inject({
        method: 'POST',
        url: `/api/${testUserId}/onboarding/complete`
      });

      expect(response.statusCode).toBe(200);

      await app.close();
    });
  });

  describe('PUT /api/:userId/selected-bank-account', () => {
    it('should update user selected bank account', async () => {
      vi.mocked(userDb.getUserFromDb).mockResolvedValue(mockUser);
      vi.mocked(userDb.updateUserSelectedBankAccountInDb).mockResolvedValue({
        id: testUserId
      });

      const { updateUserSelectedBankAccount } = userController;

      const app = await createTestApp((fastifyApp) => {
        fastifyApp.put(
          '/api/:userId/selected-bank-account',
          {
            preHandler: mockAuthMiddleware
          },
          updateUserSelectedBankAccount
        );
      });

      const response = await app.inject({
        method: 'PUT',
        url: `/api/${testUserId}/selected-bank-account`,
        payload: {
          selectedBankAccountId: '1'
        }
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.message).toBeDefined();

      await app.close();
    });
  });

  describe('PUT /api/users/:userId/language', () => {
    it('updates only the language and rejects an invalid code', async () => {
      vi.mocked(userDb.updateUserLanguageInDb).mockResolvedValue({
        id: testUserId
      });

      const app = await createTestApp((fastifyApp) => {
        fastifyApp.put('/api/users/:userId/language', {
          ...updateUserLanguageOptions,
          preHandler: mockAuthMiddleware
        });
      });

      const invalid = await app.inject({
        method: 'PUT',
        url: `/api/users/${testUserId}/language`,
        payload: { language: 'english' }
      });
      expect(invalid.statusCode).toBe(400);
      expect(userDb.updateUserLanguageInDb).not.toHaveBeenCalled();

      const response = await app.inject({
        method: 'PUT',
        url: `/api/users/${testUserId}/language`,
        payload: { language: 'lt' }
      });
      expect(response.statusCode).toBe(200);
      expect(userDb.updateUserLanguageInDb).toHaveBeenCalledWith(
        testUserId,
        'lt'
      );
      expect(userDb.updateUserAccountSettingsInDb).not.toHaveBeenCalled();

      await app.close();
    });
  });

  describe('PUT /api/:userId/account-settings', () => {
    it('should update user account settings with invoice defaults', async () => {
      vi.mocked(userDb.updateUserAccountSettingsInDb).mockResolvedValue(
        mockUser
      );

      const { updateUserAccountSettings } = userController;

      const app = await createTestApp((fastifyApp) => {
        fastifyApp.put(
          '/api/:userId/account-settings',
          {
            preHandler: mockAuthMiddleware
          },
          updateUserAccountSettings
        );
      });

      const response = await app.inject({
        method: 'PUT',
        url: `/api/${testUserId}/account-settings`,
        payload: {
          invoiceEmail: 'invoices@example.com',
          currency: DEFAULT_CURRENCY,
          preferredInvoiceLanguage: 'lt',
          isVatPayer: true,
          defaultInvoiceVatMode: 'standard_21',
          defaultInvoiceSeries: 'MB',
          defaultPaymentTermsDays: 14,
          defaultInvoiceIncludeLogo: false
        }
      });

      expect(response.statusCode).toBe(200);
      expect(userDb.updateUserAccountSettingsInDb).toHaveBeenCalledWith(
        testUserId,
        'invoices@example.com',
        'eur',
        'lt',
        true,
        'standard_21',
        'MB',
        14,
        false
      );

      await app.close();
    });
  });

  describe('PUT /api/:userId business profile signature', () => {
    const createProfileApp = () =>
      createTestApp((fastifyApp) => {
        fastifyApp.register(fastifyMultipart);
        fastifyApp.put('/api/:userId', {
          ...updateUserOptions,
          preHandler: mockAuthMiddleware
        });
      });
    const profile = {
      name: 'Test User',
      businessType: 'individual',
      businessNumber: 'BN1',
      address: '1 Test Street',
      email: 'test@example.com',
      invoiceEmail: 'invoice@example.com',
      isVatPayer: 'false'
    };
    const boundary = 'rek140-boundary';
    const multipartProfile = (mimeType: string) =>
      Buffer.from(
        [
          ...Object.entries(profile).map(
            ([name, value]) =>
              `--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`
          ),
          `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="signature"\r\nContent-Type: ${mimeType}\r\n\r\nsignature-bytes\r\n`,
          `--${boundary}--\r\n`
        ].join('')
      );

    it('stores uploaded signatures in the user folder and rejects anything else', async () => {
      const uploadedUrl =
        'https://res.cloudinary.com/demo/image/upload/v1/invoicetrackr/signatures/1/new.png';
      vi.mocked(userDb.getUserFromDb).mockResolvedValue(mockUser);
      vi.mocked(userDb.updateUserInDb).mockResolvedValue(mockUser);
      mockCloudinaryUpload.mockResolvedValue({ secure_url: uploadedUrl });

      const app = await createProfileApp();
      const upload = (mimeType: string) =>
        app.inject({
          method: 'PUT',
          url: `/api/${testUserId}`,
          headers: {
            'content-type': `multipart/form-data; boundary=${boundary}`
          },
          payload: multipartProfile(mimeType)
        });

      const wrongTypeResponse = await upload('image/svg+xml');

      expect(wrongTypeResponse.statusCode).toBe(400);
      expect(wrongTypeResponse.json().message).toBe(
        'error.user.signatureInvalidType'
      );
      expect(mockCloudinaryUpload).not.toHaveBeenCalled();

      const foreignUrlResponse = await app.inject({
        method: 'PUT',
        url: `/api/${testUserId}`,
        payload: {
          ...profile,
          isVatPayer: false,
          signature: 'http://169.254.169.254/latest'
        }
      });

      expect(foreignUrlResponse.statusCode).toBe(400);
      expect(foreignUrlResponse.json().message).toBe(
        'error.user.signatureInvalid'
      );

      const otherUserSignatureResponse = await app.inject({
        method: 'PUT',
        url: `/api/${testUserId}`,
        payload: {
          ...profile,
          isVatPayer: false,
          signature: `https://res.cloudinary.com/demo/image/upload/v1/invoicetrackr/signatures/${testUserId + 1}/theirs.png`
        }
      });

      expect(otherUserSignatureResponse.statusCode).toBe(400);
      expect(otherUserSignatureResponse.json().message).toBe(
        'error.user.signatureInvalid'
      );
      expect(userDb.updateUserInDb).not.toHaveBeenCalled();

      const uploadResponse = await upload('image/png');

      expect(uploadResponse.statusCode).toBe(200);
      expect(mockCloudinaryUpload).toHaveBeenCalledWith(
        expect.stringContaining('data:image/png;base64,'),
        expect.objectContaining({
          folder: `invoicetrackr/signatures/${testUserId}`,
          resource_type: 'image'
        })
      );
      expect(userDb.updateUserInDb).toHaveBeenCalledWith(
        expect.objectContaining({ id: testUserId }),
        uploadedUrl
      );

      await app.close();
    });
  });

  describe('business logo settings', () => {
    it('uploads a logo into the authenticated user folder', async () => {
      const uploadedUser = {
        ...mockUser,
        profilePictureUrl: 'https://res.cloudinary.com/logo.png'
      };
      vi.mocked(userDb.getUserFromDb).mockResolvedValue(mockUser);
      vi.mocked(userDb.updateUserProfilePictureInDb).mockResolvedValue(
        uploadedUser
      );
      mockCloudinaryUpload.mockResolvedValue({
        secure_url: uploadedUser.profilePictureUrl,
        public_id: 'invoicetrackr/business-logos/1/logo-id'
      });

      const app = await createTestApp((fastifyApp) => {
        fastifyApp.register(fastifyMultipart);
        fastifyApp.put('/api/:userId/profile-picture', {
          ...updateUserProfilePictureOptions,
          preHandler: mockAuthMiddleware
        });
      });
      const boundary = 'rek99-boundary';
      const payload = Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="profilePicture"; filename="logo.png"\r\nContent-Type: image/png\r\n\r\nlogo-bytes\r\n--${boundary}--\r\n`
      );

      const response = await app.inject({
        method: 'PUT',
        url: `/api/${testUserId}/profile-picture`,
        headers: {
          'content-type': `multipart/form-data; boundary=${boundary}`
        },
        payload
      });

      expect(response.statusCode).toBe(200);
      expect(mockCloudinaryUpload).toHaveBeenCalledWith(
        expect.stringContaining('data:image/png;base64,'),
        expect.objectContaining({
          folder: `invoicetrackr/business-logos/${testUserId}`,
          resource_type: 'image'
        })
      );
      expect(userDb.updateUserProfilePictureInDb).toHaveBeenCalledWith(
        testUserId,
        uploadedUser.profilePictureUrl,
        'invoicetrackr/business-logos/1/logo-id'
      );

      await app.close();
    });

    it('removes only the active profile logo reference', async () => {
      vi.mocked(userDb.getUserFromDb).mockResolvedValue(mockUser);
      vi.mocked(userDb.updateUserProfilePictureInDb).mockResolvedValue({
        ...mockUser,
        profilePictureUrl: ''
      });

      const app = await createTestApp((fastifyApp) => {
        fastifyApp.delete('/api/:userId/profile-picture', {
          ...deleteUserProfilePictureOptions,
          preHandler: mockAuthMiddleware
        });
      });

      const response = await app.inject({
        method: 'DELETE',
        url: `/api/${testUserId}/profile-picture`
      });

      expect(response.statusCode).toBe(200);
      expect(userDb.updateUserProfilePictureInDb).toHaveBeenCalledWith(
        testUserId,
        '',
        null
      );

      await app.close();
    });
  });
});
