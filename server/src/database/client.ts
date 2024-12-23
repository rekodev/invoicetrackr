import { desc, eq, and } from 'drizzle-orm';
import { ClientModel } from '../types/models';
import { db } from './db';
import { clientsTable } from './schema';

export const findClientByEmail = async (userId: number, email: string) => {
  const clients = await db
    .select({ email: clientsTable.email })
    .from(clientsTable)
    .where(and(eq(clientsTable.userId, userId), eq(clientsTable.email, email)));

  return clients.at(0);
};

export const getClientsFromDb = async (userId: number) => {
  const clients = await db
    .select()
    .from(clientsTable)
    .where(eq(clientsTable.userId, userId))
    .orderBy(desc(clientsTable.id));

  return clients;
};

export const getClientFromDb = async (userId: number, clientId: number) => {
  const clients = await db
    .select()
    .from(clientsTable)
    .where(and(eq(clientsTable.userId, userId), eq(clientsTable.id, clientId)));

  return clients.at(0);
};

export const insertClientInDb = async (
  userId: number,
  { name, address, businessNumber, businessType, type, email }: ClientModel
) => {
  const clients = await db
    .insert(clientsTable)
    .values({
      name,
      address,
      businessNumber,
      businessType,
      type,
      email,
      userId,
    })
    .returning();

  return clients.at(0);
};

export const updateClientInDb = async (
  userId: number,
  clientId: number,
  { name, address, businessNumber, businessType, type, email }: ClientModel
) => {
  const clients = await db
    .update(clientsTable)
    .set({ name, address, businessNumber, businessType, type, email })
    .where(and(eq(clientsTable.id, clientId), eq(clientsTable.userId, userId)))
    .returning();

  return clients.at(0);
};

export const deleteClientFromDb = async (userId: number, clientId: number) => {
  const clients = await db
    .delete(clientsTable)
    .where(and(eq(clientsTable.id, clientId), eq(clientsTable.userId, userId)))
    .returning();

  return clients.at(0);
};
