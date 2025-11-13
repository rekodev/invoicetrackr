import { Client } from '@invoicetrackr/types';

export type GetClientResp = {
  client: Client;
};

export type GetClientsResp = {
  clients: Array<Client>;
};

export type AddClientResp = {
  client: Client;
  message: string;
};

export type UpdateClientResp = {
  message: string;
  client: Client;
};

export type DeleteClientResp = { message: string };
