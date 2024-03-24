import api from './apiInstance';

export const getInvoices = async () => await api.get('/api/invoices');
