import { ClientDto } from '../dtos';
import { ClientModel } from '../models';

export const transformClientDto = (clientDto: ClientDto): ClientModel => {
  const { id, name, business_type, business_number, address, type, email } =
    clientDto;

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
