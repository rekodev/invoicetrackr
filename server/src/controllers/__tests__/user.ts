import { DEFAULT_CURRENCY } from '@invoicetrackr/types';
import bcrypt from 'bcryptjs';
import { describe, expect, it, vi } from 'vitest';

import * as emailVerificationDb from '../../database/email-verification';
import * as userDb from '../../database/user';
import { createTestApp, mockAuthMiddleware } from '../../test/app';
import {
  userFactory,
  userWithPasswordFactory
} from '../../test/factories/user';
import { mockResendSend } from '../../test/setup';
import * as userController from '../user';

vi.mock('../../database/user');
vi.mock('../../database/email-verification');
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
          profilePictureUrl: 'https://example.com/avatar.png',
          emailVerifiedAt: expect.any(String)
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
    it('should delete user', async () => {
      vi.mocked(userDb.deleteUserFromDb).mockResolvedValue({ id: testUserId });

      const { deleteUser } = userController;

      const app = await createTestApp((fastifyApp) => {
        fastifyApp.delete(
          '/api/:userId',
          {
            preHandler: mockAuthMiddleware
          },
          deleteUser
        );
      });

      const response = await app.inject({
        method: 'DELETE',
        url: `/api/${testUserId}`
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.message).toBeDefined();
      expect(userDb.deleteUserFromDb).toHaveBeenCalledWith(testUserId);

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
          language: 'lt',
          currency: DEFAULT_CURRENCY,
          preferredInvoiceLanguage: 'lt',
          isVatPayer: true,
          defaultInvoiceVatMode: 'standard_21',
          defaultInvoiceSeries: 'MB',
          defaultPaymentTermsDays: 14
        }
      });

      expect(response.statusCode).toBe(200);
      expect(userDb.updateUserAccountSettingsInDb).toHaveBeenCalledWith(
        testUserId,
        'lt',
        'eur',
        'lt',
        true,
        'standard_21',
        'MB',
        14
      );

      await app.close();
    });
  });
});
