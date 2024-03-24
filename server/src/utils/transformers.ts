import { InvoiceDto } from '../types/dtos/invoice';
import { InvoiceModel } from '../types/models/invoice';

export const transformInvoiceDto = (invoiceDto: InvoiceDto): InvoiceModel => {
  const {
    company,
    date,
    due_date,
    id,
    receiver,
    sender,
    services,
    status,
    total_amount,
  } = invoiceDto;

  return {
    id,
    company,
    date,
    dueDate: due_date,
    receiver: {
      address: receiver.address,
      businessNumber: receiver.business_number,
      firstName: receiver.first_name,
      lastName: receiver.last_name,
      type: receiver.type,
      email: receiver.email,
    },
    sender: {
      address: sender.address,
      businessNumber: sender.business_number,
      firstName: sender.first_name,
      lastName: sender.last_name,
      type: sender.type,
      email: sender.email,
    },
    services,
    status,
    totalAmount: total_amount,
  };
};
