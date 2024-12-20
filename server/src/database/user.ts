import { UserDto } from '../types/dtos';
import { UserModel } from '../types/models';
import { sql } from './db';

export const getUserFromDb = async (id: number) => {
  const user = await sql`
    select
      id,
      name,
      type,
      business_type,
      business_number,
      selected_bank_account_id,
      address,
      email,
      created_at,
      updated_at,
      signature,
      profile_picture_url,
      currency,
      language
    from users
    where id = ${id}
  `;

  return user;
};

export const getUserByEmailFromDb = async (email: string) => {
  const user = await sql`
    select
      id,
      name,
      password,
      type,
      business_type,
      business_number,
      selected_bank_account_id,
      address,
      email,
      created_at,
      updated_at,
      signature,
      profile_picture_url,
      currency,
      language
    from users
    where email = ${email}
  `;

  return user;
};

export const insertUser = async ({
  name,
  address,
  businessNumber,
  businessType,
  type,
  email,
  language,
  currency,
}: UserModel) => {
  const users = await sql`
      insert into users
        (name, type, business_type, business_number, address, email, language, currency)
      values
        (${name}, ${type}, ${businessType}, ${businessNumber}, ${address}, ${email}, ${language}, ${currency})
      returning name, type, businessType, businessNumber, address, email, signature, profile_picture_url, language, currency
    `;
  return users;
};

export const registerUser = async ({
  email,
  password,
}: Pick<UserModel, 'email' | 'password'>) => {
  const [user] = await sql`
    insert into users
      (email, password, currency, language)
    values
      (${email}, ${password}, 'USD', 'EN')
    returning email
  `;
  return user;
};

export const updateUserInDb = async (
  id: number,
  user: UserModel,
  signature: string
) => {
  const { name, address, businessNumber, businessType, type, email } = user;

  const [updatedUser] = await sql<Array<UserDto>>`
    update users
    set
      name = ${name},
      type = ${type},
      business_type = ${businessType},
      business_number = ${businessNumber},
      address = ${address},
      email = ${email},
      signature = ${signature}
    where id = ${id}
    returning id, name, type, business_type, business_number, address, email, signature, profile_picture_url, language, currency
  `;

  return updatedUser;
};

export const updateUserSelectedBankAccountInDb = async (
  userId: number,
  selectedBankAccountId: number
) => {
  const [updatedUser] = await sql<Array<UserDto>>`
    update users
    set
      selected_bank_account_id = ${selectedBankAccountId}
    where id = ${userId}
    returning id, name, type, business_type, business_number, address, email, signature, profile_picture_url, language, currency
  `;

  return updatedUser;
};

export const updateUserProfilePictureInDb = async (
  userId: number,
  url: string
) => {
  const [updatedUser] = await sql<Array<UserDto>>`
    update users
    set
      profile_picture_url = ${url}
    where id = ${userId}
    returning id, name, type, business_type, business_number, address, email, signature, profile_picture_url, language, currency
  `;

  return updatedUser;
};

export const updateUserAccountSettingsInDb = async (
  userId: number,
  language: string,
  currency: string
) => {
  const [updatedUser] = await sql<Array<UserDto>>`
    update users
    set
      language = ${language},
      currency = ${currency}
    where id = ${userId}
    returning id, name, type, business_type, business_number, address, email, signature, profile_picture_url, language, currency
  `;

  return updatedUser;
};

export const deleteUserFromDb = async (id: number) => {
  const [deletedUserId] = await sql`
    delete from users
    where id = ${id}
    returning id
  `;

  return deletedUserId;
};
