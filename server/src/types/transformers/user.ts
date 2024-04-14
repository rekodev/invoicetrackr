import { UserDto } from '../dtos/user';
import { UserModel } from '../models/user';

export const transformUserDto = (userDto: UserDto): UserModel => {
  const { id, name, business_type, business_number, address, type, email } =
    userDto;

  return {
    id,
    name,
    businessType: business_type,
    businessNumber: business_number,
    address,
    type,
    email,
  };
};
