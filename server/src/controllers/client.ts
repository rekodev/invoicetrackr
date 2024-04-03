import { FastifyReply, FastifyRequest } from 'fastify';
import { clients } from '../data';
import { ClientModel } from '../types/models/client';

export const getClients = (req: FastifyRequest, reply: FastifyReply) => {
  reply.send(clients);
};

export const getClient = (
  req: FastifyRequest<{ Params: { id: number } }>,
  reply: FastifyReply
) => {
  const { id } = req.params;
};

export const postClient = (
  req: FastifyRequest<{ Body: ClientModel }>,
  reply: FastifyReply
) => {
  const { id, address, businessNumber, businessType, name, type, email } =
    req.body;
};

export const updateClient = (
  req: FastifyRequest<{ Params: { id: number } }>,
  reply: FastifyReply
) => {
  const { id } = req.params;
};

export const deleteClient = (
  req: FastifyRequest<{ Params: { id: number } }>,
  reply: FastifyReply
) => {
  const { id } = req.params;
};
