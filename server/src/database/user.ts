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
      address,
      email,
      created_at,
      updated_at
    from users
    where id = ${id}
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
}: UserModel) => {
  const users = await sql`
      insert into users
        (name, type, business_type, business_number, address, email)
      values
        (${name}, ${type}, ${businessType}, ${businessNumber}, ${address}, ${email})
      returning name, type, businessType, businessNumber, address, email
    `;
  return users;
};
