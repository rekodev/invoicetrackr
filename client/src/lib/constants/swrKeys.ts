const SWRKeys = {
  user: (userId: number) => `/api/users/${userId}`,
  invoice: (userId: number, invoiceId: number) =>
    `/api/${userId}/invoices/${invoiceId}`,
  invoices: (userId: number) => `/api/${userId}/invoices`,
  clients: (userId: number) => `/api/${userId}/clients`,
  bankAccount: (userId: number, bankAccountId: number) =>
    `/api/${userId}/banking-information/${bankAccountId}`,
};

export default SWRKeys;
