import { and, desc, eq } from 'drizzle-orm';

import { SelectClient, clientsTable } from './schema';
import { db } from './db';

export const findClientByEmail = async (userId: number, email: string) => {
  if (!email) return;

  const clients = await db
    .select({ email: clientsTable.email })
    .from(clientsTable)
    .where(and(eq(clientsTable.userId, userId), eq(clientsTable.email, email)));

  return clients.at(0);
};

export const getClientsFromDb = async (
  userId: number
): Promise<Array<Omit<SelectClient, 'createdAt' | 'updatedAt' | 'userId'>>> => {
  const clients = await db
    .select({
      id: clientsTable.id,
      name: clientsTable.name,
      address: clientsTable.address,
      businessNumber: clientsTable.businessNumber,
      businessType: clientsTable.businessType,
      type: clientsTable.type,
      email: clientsTable.email
    })
    .from(clientsTable)
    .where(eq(clientsTable.userId, userId))
    .orderBy(desc(clientsTable.id));

  return clients;
};

export const getClientFromDb = async (
  userId: number,
  clientId: number
): Promise<SelectClient | undefined> => {
  const clients = await db
    .select()
    .from(clientsTable)
    .where(and(eq(clientsTable.userId, userId), eq(clientsTable.id, clientId)));

  return clients.at(0);
};

export const insertClientInDb = async (
  userId: number,
  {
    name,
    address,
    businessNumber,
    businessType,
    type,
    email
  }: Omit<SelectClient, 'id' | 'createdAt' | 'updatedAt' | 'userId'>
): Promise<SelectClient | undefined> => {
  const clients = await db
    .insert(clientsTable)
    .values({
      name,
      address,
      businessNumber,
      businessType,
      type,
      email,
      userId
    })
    .returning();

  return clients.at(0);
};

export const updateClientInDb = async (
  userId: number,
  clientId: number,
  {
    name,
    address,
    businessNumber,
    businessType,
    type,
    email
  }: Partial<SelectClient>
): Promise<SelectClient | undefined> => {
  const clients = await db
    .update(clientsTable)
    .set({ name, address, businessNumber, businessType, type, email })
    .where(and(eq(clientsTable.id, clientId), eq(clientsTable.userId, userId)))
    .returning();

  return clients.at(0);
};

export const deleteClientFromDb = async (
  userId: number,
  clientId: number
): Promise<{ id: number } | undefined> => {
  const clients = await db
    .delete(clientsTable)
    .where(and(eq(clientsTable.id, clientId), eq(clientsTable.userId, userId)))
    .returning({ id: clientsTable.id });

  return clients.at(0);
};
