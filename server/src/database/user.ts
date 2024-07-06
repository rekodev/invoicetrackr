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
      address,
      email,
      created_at,
      updated_at,
      signature
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
    returning id, name, type, business_type, business_number, address, email, signature
  `;

  return updatedUser;
};
