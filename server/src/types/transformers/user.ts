import { UserDto } from '../dtos';
import { UserModel } from '../models';

export const transformUserDto = (userDto: UserDto): UserModel => {
  const {
    id,
    name,
    business_type,
    business_number,
    address,
    type,
    email,
    signature,
    password,
  } = userDto;

  return {
    id,
    name,
    businessType: business_type,
    businessNumber: business_number,
    address,
    type,
    email,
    signature,
    password,
  };
};
