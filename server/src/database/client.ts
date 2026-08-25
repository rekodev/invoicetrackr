import { and, desc, eq, isNull, ne, or, sql } from 'drizzle-orm';

import { db } from './db';
import type { SelectClient } from './schema';
import { clientsTable } from './schema';

const clientSelection = {
  id: clientsTable.id,
  name: clientsTable.name,
  address: clientsTable.address,
  businessNumber: clientsTable.businessNumber,
  vatNumber: clientsTable.vatNumber,
  businessType: clientsTable.businessType,
  type: clientsTable.type,
  email: clientsTable.email,
  archivedAt: clientsTable.archivedAt
};

const normalizeName = (value: string) => value.trim().toLowerCase();
const normalizeBusinessNumber = (value: string) =>
  value.trim().replaceAll(' ', '').toUpperCase();

export const findPotentialDuplicateClientFromDb = async (
  userId: number,
  client: Pick<SelectClient, 'name' | 'businessNumber' | 'email'>,
  excludeClientId?: number
) => {
  const normalizedName = normalizeName(client.name);
  const normalizedBusinessNumber = normalizeBusinessNumber(
    client.businessNumber
  );
  const normalizedEmail = client.email.trim().toLowerCase();

  const clients = await db
    .select({
      id: clientsTable.id,
      name: clientsTable.name,
      businessNumber: clientsTable.businessNumber
    })
    .from(clientsTable)
    .where(
      and(
        eq(clientsTable.userId, userId),
        isNull(clientsTable.archivedAt),
        excludeClientId ? ne(clientsTable.id, excludeClientId) : undefined,
        or(
          sql`lower(trim(${clientsTable.name})) = ${normalizedName}`,
          sql`replace(upper(trim(${clientsTable.businessNumber})), ' ', '') = ${normalizedBusinessNumber}`,
          sql`${normalizedEmail} <> '' AND lower(trim(${clientsTable.email})) = ${normalizedEmail}`
        )
      )
    )
    .limit(1);

  return clients.at(0);
};

export const getClientsFromDb = async (
  userId: number
): Promise<Array<Omit<SelectClient, 'createdAt' | 'updatedAt' | 'userId'>>> => {
  const clients = await db
    .select(clientSelection)
    .from(clientsTable)
    .where(
      and(eq(clientsTable.userId, userId), isNull(clientsTable.archivedAt))
    )
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
    vatNumber,
    businessType,
    type,
    email
  }: Omit<
    SelectClient,
    'id' | 'createdAt' | 'updatedAt' | 'archivedAt' | 'userId'
  >
): Promise<SelectClient | undefined> => {
  const clients = await db
    .insert(clientsTable)
    .values({
      name,
      address,
      businessNumber,
      vatNumber,
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
    vatNumber,
    businessType,
    type,
    email
  }: Partial<SelectClient>
): Promise<SelectClient | undefined> => {
  const clients = await db
    .update(clientsTable)
    .set({
      name,
      address,
      businessNumber,
      vatNumber,
      businessType,
      type,
      email,
      updatedAt: new Date().toISOString()
    })
    .where(
      and(
        eq(clientsTable.id, clientId),
        eq(clientsTable.userId, userId),
        isNull(clientsTable.archivedAt)
      )
    )
    .returning();

  return clients.at(0);
};

export const archiveClientInDb = async (
  userId: number,
  clientId: number
): Promise<{ id: number; archivedAt: string | null } | undefined> => {
  const now = new Date().toISOString();
  const clients = await db
    .update(clientsTable)
    .set({ archivedAt: now, updatedAt: now })
    .where(
      and(
        eq(clientsTable.id, clientId),
        eq(clientsTable.userId, userId),
        isNull(clientsTable.archivedAt)
      )
    )
    .returning({
      id: clientsTable.id,
      archivedAt: clientsTable.archivedAt
    });

  return clients.at(0);
};
