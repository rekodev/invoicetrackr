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
    where user_id = ${userId} order by id desc
  `;

  return clients;
};

export const getClientFromDb = async (userId: number, clientId: number) => {
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
      where user_id = ${userId} AND id = ${clientId}
    `;

  return clients;
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

export const updateClientInDb = async (
  userId: number,
  clientId: number,
  { name, address, businessNumber, businessType, type, email }: ClientModel
) => {
  const clients = await sql`
  update clients
  set
    name = ${name},
    address = ${address},
    business_number = ${businessNumber},
    business_type = ${businessType},
    type = ${type},
    email = ${email}
  where id = ${clientId} and user_id = ${userId}
  returning id, name, type, business_type, business_number, address, email
`;

  return clients;
};

export const deleteClientFromDb = async (userId: number, clientId: number) => {
  const clients = await sql`
  delete from clients
  where id = ${clientId} and user_id = ${userId}
  returning *
`;

  return clients;
};
