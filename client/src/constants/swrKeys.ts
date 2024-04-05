const SWRKeys = {
  user: (userId: number) => `/api/users/${userId}`,
  invoices: (userId: number) => `/api/${userId}/invoices`,
  clients: (userId: number) => `/api/${userId}/clients`,
};

export default SWRKeys;
