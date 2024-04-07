import { ClientDto } from '../dtos/client';
import { ClientModel } from '../models/client';

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
