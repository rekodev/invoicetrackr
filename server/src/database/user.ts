import { eq } from 'drizzle-orm';

import { UserModel } from '../types/models';
import { db } from './db';
import { usersTable } from './schema';

export const getUserFromDb = async (id: number) => {
  const users = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      type: usersTable.type,
      businessType: usersTable.businessType,
      businessNumber: usersTable.businessNumber,
      selectedBankAccountId: usersTable.selectedBankAccountId,
      address: usersTable.address,
      email: usersTable.email,
      createdAt: usersTable.createdAt,
      updatedAt: usersTable.updatedAt,
      signature: usersTable.signature,
      profilePictureUrl: usersTable.profilePictureUrl,
      currency: usersTable.currency,
      language: usersTable.language,
    })
    .from(usersTable)
    .where(eq(usersTable.id, id));

  return users.at(0);
};

export const getUserByEmailFromDb = async (email: string) => {
  const users = await db
    .select({
      id: usersTable.id,
      name: usersTable.name,
      type: usersTable.type,
      businessType: usersTable.businessType,
      businessNumber: usersTable.businessNumber,
      selectedBankAccountId: usersTable.selectedBankAccountId,
      address: usersTable.address,
      email: usersTable.email,
      createdAt: usersTable.createdAt,
      updatedAt: usersTable.updatedAt,
      signature: usersTable.signature,
      profilePictureUrl: usersTable.profilePictureUrl,
      currency: usersTable.currency,
      language: usersTable.language,
      password: usersTable.password,
    })
    .from(usersTable)
    .where(eq(usersTable.email, email));

  return users.at(0);
};

export const registerUser = async ({
  email,
  password,
}: Pick<UserModel, 'email' | 'password'>) => {
  const users = await db
    .insert(usersTable)
    .values({
      email,
      password,
      currency: 'USD',
      language: 'EN',
      type: 'sender',
      businessType: 'individual',
      businessNumber: '',
      name: '',
      address: '',
      signature: '',
      profilePictureUrl: '',
    })
    .returning({ email: usersTable.email });

  return users.at(0);
};

export const updateUserInDb = async (
  id: number,
  user: UserModel,
  signature: string
) => {
  const { name, address, businessNumber, businessType, type, email } = user;

  const users = await db
    .update(usersTable)
    .set({
      name,
      type,
      businessType,
      businessNumber,
      address,
      email,
      signature,
    })
    .where(eq(usersTable.id, id))
    .returning({
      id: usersTable.id,
      name: usersTable.name,
      type: usersTable.type,
      businessType: usersTable.businessType,
      businessNumber: usersTable.businessNumber,
      address: usersTable.address,
      email: usersTable.email,
      signature: usersTable.signature,
      profilePictureUrl: usersTable.profilePictureUrl,
      currency: usersTable.currency,
      language: usersTable.language,
    });

  return users.at(0);
};

export const updateUserSelectedBankAccountInDb = async (
  userId: number,
  selectedBankAccountId: number
) => {
  const users = await db
    .update(usersTable)
    .set({ selectedBankAccountId })
    .where(eq(usersTable.id, userId))
    .returning({
      id: usersTable.id,
      name: usersTable.name,
      type: usersTable.type,
      businessType: usersTable.businessType,
      businessNumber: usersTable.businessNumber,
      address: usersTable.address,
      email: usersTable.email,
      signature: usersTable.signature,
      profilePictureUrl: usersTable.profilePictureUrl,
      language: usersTable.language,
      currency: usersTable.currency,
    });

  return users.at(0);
};

export const updateUserProfilePictureInDb = async (
  userId: number,
  url: string
) => {
  const users = await db
    .update(usersTable)
    .set({ profilePictureUrl: url })
    .where(eq(usersTable.id, userId))
    .returning({
      id: usersTable.id,
      name: usersTable.name,
      type: usersTable.type,
      businessType: usersTable.businessType,
      businessNumber: usersTable.businessNumber,
      address: usersTable.address,
      email: usersTable.email,
      signature: usersTable.signature,
      profilePictureUrl: usersTable.profilePictureUrl,
      language: usersTable.language,
      currency: usersTable.currency,
    });

  return users.at(0);
};

export const updateUserAccountSettingsInDb = async (
  userId: number,
  language: string,
  currency: string
) => {
  const users = await db
    .update(usersTable)
    .set({ language, currency })
    .where(eq(usersTable.id, userId))
    .returning({
      id: usersTable.id,
      name: usersTable.name,
      type: usersTable.type,
      businessType: usersTable.businessType,
      businessNumber: usersTable.businessNumber,
      address: usersTable.address,
      email: usersTable.email,
      signature: usersTable.signature,
      profilePictureUrl: usersTable.profilePictureUrl,
      language: usersTable.language,
      currency: usersTable.currency,
    });

  return users.at(0);
};

export const deleteUserFromDb = async (id: number) => {
  const users = await db
    .delete(usersTable)
    .where(eq(usersTable.id, id))
    .returning({ id: usersTable.id });

  return users.at(0);
};

export const getUserPasswordHashFromDb = async (id: number) => {
  const users = await db
    .select({ password: usersTable.password })
    .from(usersTable)
    .where(eq(usersTable.id, id));

  return users.at(0).password;
};

export const changeUserPasswordInDb = async (id: number, password: string) => {
  const users = await db
    .update(usersTable)
    .set({ password })
    .where(eq(usersTable.id, id))
    .returning({ id: usersTable.id });

  return users.at(0);
};
