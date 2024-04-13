import { InvoiceDto } from '../dtos/invoice';
import { InvoiceModel } from '../models/invoice';

export const transformInvoiceDto = (invoiceDto: InvoiceDto): InvoiceModel => {
  const {
    date,
    due_date,
    id,
    invoice_id,
    receiver_address,
    receiver_business_number,
    receiver_business_type,
    receiver_email,
    receiver_id,
    receiver_name,
    receiver_type,
    sender_address,
    sender_business_number,
    sender_business_type,
    sender_email,
    sender_id,
    sender_name,
    sender_type,
    services,
    status,
    total_amount,
  } = invoiceDto;

  return {
    id,
    invoiceId: invoice_id,
    date,
    dueDate: due_date,
    receiver: {
      id: receiver_id,
      name: receiver_name,
      type: receiver_type,
      businessType: receiver_business_type,
      businessNumber: receiver_business_number,
      address: receiver_address,
      email: receiver_email,
    },
    sender: {
      id: sender_id,
      name: sender_name,
      type: sender_type,
      businessType: sender_business_type,
      businessNumber: sender_business_number,
      address: sender_address,
      email: sender_email,
    },
    services,
    status,
    totalAmount: total_amount,
  };
};
