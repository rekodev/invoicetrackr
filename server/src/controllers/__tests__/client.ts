import type { ClientMutationBody } from '@invoicetrackr/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as clientDb from '../../database/client';
import {
  archiveClientOptions,
  getClientOptions,
  getClientsOptions,
  postClientOptions,
  updateClientOptions
} from '../../options/client';
import { createTestApp, mockAuthMiddleware } from '../../test/app';
import { clientFactory } from '../../test/factories/client';

vi.mock('../../database/client');

describe('Client Controller', () => {
  const testUserId = 1;
  const mockClient = clientFactory.build();
  const mockClient2 = clientFactory.build({ id: 2 });
  const validPayload: ClientMutationBody = {
    type: 'receiver',
    businessType: 'individual',
    name: mockClient.name,
    email: mockClient.email,
    address: mockClient.address,
    businessNumber: mockClient.businessNumber,
    vatNumber: null
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns active clients for a user', async () => {
    vi.mocked(clientDb.getClientsFromDb).mockResolvedValue([
      mockClient,
      mockClient2
    ]);
    const app = await createTestApp((fastifyApp) => {
      fastifyApp.get('/api/:userId/clients', {
        ...getClientsOptions,
        preHandler: mockAuthMiddleware
      });
    });

    const response = await app.inject({
      method: 'GET',
      url: `/api/${testUserId}/clients`
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().clients).toHaveLength(2);
    expect(clientDb.getClientsFromDb).toHaveBeenCalledWith(testUserId);
    await app.close();
  });

  it('returns a specific client', async () => {
    vi.mocked(clientDb.getClientFromDb).mockResolvedValue(mockClient);
    const app = await createTestApp((fastifyApp) => {
      fastifyApp.get('/api/:userId/clients/:id', {
        ...getClientOptions,
        preHandler: mockAuthMiddleware
      });
    });

    const response = await app.inject({
      method: 'GET',
      url: `/api/${testUserId}/clients/${mockClient.id}`
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().client.id).toBe(mockClient.id);
    await app.close();
  });

  it('returns 404 when a client is not found', async () => {
    vi.mocked(clientDb.getClientFromDb).mockResolvedValue(undefined);
    const app = await createTestApp((fastifyApp) => {
      fastifyApp.get('/api/:userId/clients/:id', {
        ...getClientOptions,
        preHandler: mockAuthMiddleware
      });
    });

    const response = await app.inject({
      method: 'GET',
      url: `/api/${testUserId}/clients/999`
    });

    expect(response.statusCode).toBe(404);
    await app.close();
  });

  it('normalizes and creates a valid client', async () => {
    vi.mocked(clientDb.findPotentialDuplicateClientFromDb).mockResolvedValue(
      undefined
    );
    vi.mocked(clientDb.insertClientInDb).mockResolvedValue(mockClient);
    const app = await createTestApp((fastifyApp) => {
      fastifyApp.post('/api/:userId/clients', {
        ...postClientOptions,
        preHandler: mockAuthMiddleware
      });
    });

    const response = await app.inject({
      method: 'POST',
      url: `/api/${testUserId}/clients`,
      payload: {
        ...validPayload,
        name: ` ${validPayload.name} `,
        businessNumber: ` ${validPayload.businessNumber} `
      }
    });

    expect(response.statusCode).toBe(201);
    expect(clientDb.insertClientInDb).toHaveBeenCalledWith(
      testUserId,
      expect.objectContaining({
        name: validPayload.name,
        businessNumber: validPayload.businessNumber
      })
    );
    await app.close();
  });

  it('returns a conflict warning for a potential duplicate', async () => {
    vi.mocked(clientDb.findPotentialDuplicateClientFromDb).mockResolvedValue({
      id: mockClient.id,
      name: mockClient.name,
      businessNumber: mockClient.businessNumber
    });
    const app = await createTestApp((fastifyApp) => {
      fastifyApp.post('/api/:userId/clients', {
        ...postClientOptions,
        preHandler: mockAuthMiddleware
      });
    });

    const response = await app.inject({
      method: 'POST',
      url: `/api/${testUserId}/clients`,
      payload: validPayload
    });

    expect(response.statusCode).toBe(409);
    expect(response.json().code).toBe('CONFLICT');
    expect(clientDb.insertClientInDb).not.toHaveBeenCalled();
    await app.close();
  });

  it('creates an acknowledged potential duplicate', async () => {
    vi.mocked(clientDb.findPotentialDuplicateClientFromDb).mockResolvedValue({
      id: mockClient.id,
      name: mockClient.name,
      businessNumber: mockClient.businessNumber
    });
    vi.mocked(clientDb.insertClientInDb).mockResolvedValue(mockClient2);
    const app = await createTestApp((fastifyApp) => {
      fastifyApp.post('/api/:userId/clients', {
        ...postClientOptions,
        preHandler: mockAuthMiddleware
      });
    });

    const response = await app.inject({
      method: 'POST',
      url: `/api/${testUserId}/clients`,
      payload: { ...validPayload, duplicateAcknowledged: true }
    });

    expect(response.statusCode).toBe(201);
    expect(clientDb.insertClientInDb).toHaveBeenCalled();
    await app.close();
  });

  it('rejects invalid email before database mutation', async () => {
    const app = await createTestApp((fastifyApp) => {
      fastifyApp.post('/api/:userId/clients', {
        ...postClientOptions,
        preHandler: mockAuthMiddleware
      });
    });

    const response = await app.inject({
      method: 'POST',
      url: `/api/${testUserId}/clients`,
      payload: { ...validPayload, email: 'not-an-email' }
    });

    expect(response.statusCode).toBe(400);
    expect(clientDb.insertClientInDb).not.toHaveBeenCalled();
    await app.close();
  });

  it('updates an active client and excludes itself from duplicate matching', async () => {
    const updatedClient = { ...mockClient, name: 'Updated Client' };
    vi.mocked(clientDb.getClientFromDb).mockResolvedValue(mockClient);
    vi.mocked(clientDb.findPotentialDuplicateClientFromDb).mockResolvedValue(
      undefined
    );
    vi.mocked(clientDb.updateClientInDb).mockResolvedValue(updatedClient);
    const app = await createTestApp((fastifyApp) => {
      fastifyApp.put('/api/:userId/clients/:id', {
        ...updateClientOptions,
        preHandler: mockAuthMiddleware
      });
    });

    const response = await app.inject({
      method: 'PUT',
      url: `/api/${testUserId}/clients/${mockClient.id}`,
      payload: { ...validPayload, id: mockClient.id, name: 'Updated Client' }
    });

    expect(response.statusCode).toBe(200);
    expect(clientDb.findPotentialDuplicateClientFromDb).toHaveBeenCalledWith(
      testUserId,
      expect.objectContaining({ name: 'Updated Client' }),
      mockClient.id
    );
    await app.close();
  });

  it('returns a conflict warning when an update matches another client', async () => {
    vi.mocked(clientDb.getClientFromDb).mockResolvedValue(mockClient);
    vi.mocked(clientDb.findPotentialDuplicateClientFromDb).mockResolvedValue({
      id: mockClient2.id,
      name: mockClient2.name,
      businessNumber: mockClient2.businessNumber
    });
    const app = await createTestApp((fastifyApp) => {
      fastifyApp.put('/api/:userId/clients/:id', {
        ...updateClientOptions,
        preHandler: mockAuthMiddleware
      });
    });

    const response = await app.inject({
      method: 'PUT',
      url: `/api/${testUserId}/clients/${mockClient.id}`,
      payload: { ...validPayload, id: mockClient.id, name: mockClient2.name }
    });

    expect(response.statusCode).toBe(409);
    expect(response.json().code).toBe('CONFLICT');
    expect(clientDb.updateClientInDb).not.toHaveBeenCalled();
    await app.close();
  });

  it('archives a client without deleting its historical record', async () => {
    vi.mocked(clientDb.getClientFromDb).mockResolvedValue(mockClient);
    vi.mocked(clientDb.archiveClientInDb).mockResolvedValue({
      id: mockClient.id,
      archivedAt: new Date().toISOString()
    });
    const app = await createTestApp((fastifyApp) => {
      fastifyApp.delete('/api/:userId/clients/:id', {
        ...archiveClientOptions,
        preHandler: mockAuthMiddleware
      });
    });

    const response = await app.inject({
      method: 'DELETE',
      url: `/api/${testUserId}/clients/${mockClient.id}`
    });

    expect(response.statusCode).toBe(200);
    expect(clientDb.archiveClientInDb).toHaveBeenCalledWith(
      testUserId,
      mockClient.id
    );
    await app.close();
  });

  it('does not archive an already archived client', async () => {
    vi.mocked(clientDb.getClientFromDb).mockResolvedValue({
      ...mockClient,
      archivedAt: new Date().toISOString()
    });
    const app = await createTestApp((fastifyApp) => {
      fastifyApp.delete('/api/:userId/clients/:id', {
        ...archiveClientOptions,
        preHandler: mockAuthMiddleware
      });
    });

    const response = await app.inject({
      method: 'DELETE',
      url: `/api/${testUserId}/clients/${mockClient.id}`
    });

    expect(response.statusCode).toBe(404);
    expect(clientDb.archiveClientInDb).not.toHaveBeenCalled();
    await app.close();
  });
});
