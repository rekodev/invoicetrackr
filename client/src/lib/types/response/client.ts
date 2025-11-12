import { ClientModel } from '../models/client';

export type GetClientResp = {
  client: ClientModel;
};

export type GetClientsResp = {
  clients: Array<ClientModel>;
};

export type AddClientResp = {
  client: ClientModel;
  message: string;
};

export type UpdateClientResp = {
  message: string;
  client: ClientModel;
};

export type DeleteClientResp = { message: string };
