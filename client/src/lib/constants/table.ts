export const columns = [
  { name: 'ID', uid: 'id', sortable: true },
  { name: 'RECEIVER', uid: 'receiver', sortable: true },
  { name: 'AMOUNT', uid: 'totalAmount', sortable: true },
  { name: 'DATE', uid: 'date', sortable: true },
  { name: 'STATUS', uid: 'status', sortable: true },
  { name: 'ACTIONS', uid: 'actions' }
];

export const statusOptions = [
  { name: 'Paid', uid: 'paid' },
  { name: 'Canceled', uid: 'canceled' },
  { name: 'Pending', uid: 'pending' }
];
