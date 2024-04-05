import { ClientDto } from '../types/dtos/client';
import { InvoiceDto } from '../types/dtos/invoice';
import { UserDto } from '../types/dtos/user';
import { ClientModel } from '../types/models/client';
import { InvoiceModel } from '../types/models/invoice';
import { UserModel } from '../types/models/user';

export const transformInvoiceDto = (invoiceDto: InvoiceDto): InvoiceModel => {
  const {
    company,
    date,
    due_date,
    id,
    invoice_id,
    receiver,
    sender,
    services,
    status,
    total_amount,
  } = invoiceDto;

  return {
    id,
    invoiceId: invoice_id,
    company,
    date,
    dueDate: due_date,
    receiver: {
      address: receiver.address,
      businessNumber: receiver.business_number,
      name: receiver.name,
      type: receiver.type,
      email: receiver.email,
    },
    sender: {
      address: sender.address,
      businessNumber: sender.business_number,
      name: sender.name,
      type: sender.type,
      email: sender.email,
    },
    services,
    status,
    totalAmount: total_amount,
  };
};

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
