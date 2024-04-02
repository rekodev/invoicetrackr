import { clients } from '../data';
import { ClientModel } from '../types/models/client';

export const getClients = (req, reply) => {
  reply.send(clients);
};

export const getClient = (req, reply) => {
  const { id } = req.params;
};

export const postClient = (req, reply) => {
  const { id, address, businessNumber, businessType, name, type, email } = <
    ClientModel
  >req.body;
};

export const updateClient = (req, reply) => {
  const { id } = req.params;
};

export const deleteClient = (req, reply) => {
  const { id } = req.params;
};
