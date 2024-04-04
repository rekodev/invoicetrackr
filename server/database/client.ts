import { ClientModel } from '../src/types/models/client';
import { sql } from './db';

export const getClientsFromDb = async (userId: number) => {
  const clients = await sql`
    select
      id,
      name,
      type,
      business_type,
      business_number,
      address,
      email,
      created_at,
      updated_at
    from clients
    where user_id = ${userId}
  `;

  return clients;
};

export const getClientFromDb = async (id: number) => {
  const client = await sql`
      select
        id,
        name,
        type,
        business_type,
        business_number,
        address,
        email,
        created_at,
        updated_at
      from clients
      where id = ${id}
    `;

  return client;
};

export const insertClientToDb = async (
  userId: number,
  { name, address, businessNumber, businessType, type, email }: ClientModel
) => {
  const clients = await sql`
        insert into clients
          (name, type, business_type, business_number, address, email, user_id)
        values
          (${name}, ${type}, ${businessType}, ${businessNumber}, ${address}, ${email}, ${userId})
        returning name, type, business_type, business_number, address, email
      `;

  return clients;
};
