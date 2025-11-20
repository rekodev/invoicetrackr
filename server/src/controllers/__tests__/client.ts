import { describe, expect, it, vi } from 'vitest';
import { ClientBody } from '@invoicetrackr/types';

import * as clientController from '../client';
import * as clientDb from '../../database/client';
import { createTestApp, mockAuthMiddleware } from '../../test/app';
import { clientFactory } from '../../test/factories/client';

vi.mock('../../database/client');

describe('Client Controller', () => {
  const testUserId = 1;
  const mockClient = clientFactory.build();
  const mockClient2 = clientFactory.build({ id: 2 });

  describe('GET /api/:userId/clients', () => {
    it('should return all clients for a user', async () => {
      vi.mocked(clientDb.getClientsFromDb).mockResolvedValue([
        mockClient,
        mockClient2
      ]);

      const { getClients } = clientController;

      const app = await createTestApp((fastifyApp) => {
        fastifyApp.get(
          '/api/:userId/clients',
          {
            preHandler: mockAuthMiddleware
          },
          getClients
        );
      });

      const response = await app.inject({
        method: 'GET',
        url: `/api/${testUserId}/clients`
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.clients).toBeDefined();
      expect(Array.isArray(body.clients)).toBe(true);
      expect(body.clients.length).toBe(2);
      expect(clientDb.getClientsFromDb).toHaveBeenCalledWith(testUserId);

      await app.close();
    });
  });

  describe('GET /api/:userId/clients/:id', () => {
    it('should return a specific client', async () => {
      vi.mocked(clientDb.getClientFromDb).mockResolvedValue(mockClient);

      const { getClient } = clientController;

      const app = await createTestApp((fastifyApp) => {
        fastifyApp.get(
          '/api/:userId/clients/:id',
          {
            preHandler: mockAuthMiddleware
          },
          getClient
        );
      });

      const response = await app.inject({
        method: 'GET',
        url: `/api/${testUserId}/clients/${mockClient.id}`
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.client).toBeDefined();
      expect(body.client.id).toBe(mockClient.id);
      expect(clientDb.getClientFromDb).toHaveBeenCalledWith(
        testUserId,
        mockClient.id
      );

      await app.close();
    });

    it('should return 404 when client not found', async () => {
      vi.mocked(clientDb.getClientFromDb).mockResolvedValue(undefined);

      const { getClient } = clientController;

      const app = await createTestApp((fastifyApp) => {
        fastifyApp.get(
          '/api/:userId/clients/:id',
          {
            preHandler: mockAuthMiddleware
          },
          getClient
        );
      });

      const response = await app.inject({
        method: 'GET',
        url: `/api/${testUserId}/clients/999`
      });

      expect(response.statusCode).toBe(404);

      await app.close();
    });
  });

  describe('POST /api/:userId/clients', () => {
    it('should create a new client', async () => {
      vi.mocked(clientDb.findClientByEmail).mockResolvedValue(undefined);
      vi.mocked(clientDb.insertClientInDb).mockResolvedValue(mockClient);

      const { postClient } = clientController;

      const app = await createTestApp((fastifyApp) => {
        fastifyApp.post(
          '/api/:userId/clients',
          {
            preHandler: mockAuthMiddleware
          },
          postClient
        );
      });

      const clientPayload: ClientBody = {
        id: mockClient.id,
        type: 'receiver',
        businessType: 'individual',
        name: mockClient.name,
        email: mockClient.email,
        address: mockClient.address,
        businessNumber: mockClient.businessNumber
      };

      const response = await app.inject({
        method: 'POST',
        url: `/api/${testUserId}/clients`,
        payload: clientPayload
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.client).toBeDefined();
      expect(body.message).toBeDefined();

      await app.close();
    });

    it('should return 400 when client already exists', async () => {
      vi.mocked(clientDb.findClientByEmail).mockResolvedValue(mockClient);

      const { postClient } = clientController;

      const app = await createTestApp((fastifyApp) => {
        fastifyApp.post(
          '/api/:userId/clients',
          {
            preHandler: mockAuthMiddleware
          },
          postClient
        );
      });

      const response = await app.inject({
        method: 'POST',
        url: `/api/${testUserId}/clients`,
        payload: {
          name: mockClient.name,
          email: mockClient.email
        }
      });

      expect(response.statusCode).toBe(400);

      await app.close();
    });
  });

  describe('PUT /api/:userId/clients/:id', () => {
    it('should update an existing client', async () => {
      const updatedClient = { ...mockClient, name: 'Updated Client' };
      vi.mocked(clientDb.updateClientInDb).mockResolvedValue(updatedClient);

      const { updateClient } = clientController;

      const app = await createTestApp((fastifyApp) => {
        fastifyApp.put(
          '/api/:userId/clients/:id',
          {
            preHandler: mockAuthMiddleware
          },
          updateClient
        );
      });

      const response = await app.inject({
        method: 'PUT',
        url: `/api/${testUserId}/clients/${mockClient.id}`,
        payload: {
          name: 'Updated Client',
          email: mockClient.email
        }
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.client).toBeDefined();
      expect(body.message).toBeDefined();

      await app.close();
    });
  });

  describe('DELETE /api/:userId/clients/:id', () => {
    it('should delete a client', async () => {
      vi.mocked(clientDb.deleteClientFromDb).mockResolvedValue(mockClient);

      const { deleteClient } = clientController;

      const app = await createTestApp((fastifyApp) => {
        fastifyApp.delete(
          '/api/:userId/clients/:id',
          {
            preHandler: mockAuthMiddleware
          },
          deleteClient
        );
      });

      const response = await app.inject({
        method: 'DELETE',
        url: `/api/${testUserId}/clients/${mockClient.id}`
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.message).toBeDefined();

      await app.close();
    });
  });
});
