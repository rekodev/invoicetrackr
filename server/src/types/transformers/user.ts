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
    selected_bank_account_id,
    password,
    profile_picture_url,
  } = userDto;

  return {
    id,
    name,
    businessType: business_type,
    businessNumber: business_number,
    selectedBankAccountId: selected_bank_account_id,
    address,
    type,
    email,
    signature,
    password,
    profilePictureUrl: profile_picture_url,
  };
};
