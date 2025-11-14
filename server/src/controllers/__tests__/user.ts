import { describe, expect, it, vi } from 'vitest';
import bcrypt from 'bcryptjs';

import * as paymentDb from '../../database/payment';
import * as userController from '../user';
import * as userDb from '../../database/user';
import { createTestApp, mockAuthMiddleware } from '../../test/app';
import {
  userFactory,
  userWithPasswordFactory
} from '../../test/factories/user';
import { stripe } from '../../config/stripe';

vi.mock('../../database/user');
vi.mock('../../database/payment');
vi.mock('bcryptjs');
vi.mock('../../config/stripe', () => ({
  stripe: {
    customers: {
      del: vi.fn().mockResolvedValue({})
    },
    subscriptions: {
      retrieve: vi.fn().mockResolvedValue({ status: 'active' })
    }
  }
}));

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

  describe('DELETE /api/:userId', () => {
    it('should delete user', async () => {
      vi.mocked(paymentDb.getStripeCustomerIdFromDb).mockResolvedValue(
        'cus_test123'
      );
      vi.mocked(stripe.customers.del).mockResolvedValue({} as never);
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
      expect(paymentDb.getStripeCustomerIdFromDb).toHaveBeenCalledWith(
        testUserId
      );
      expect(stripe.customers.del).toHaveBeenCalledWith('cus_test123');

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
});
