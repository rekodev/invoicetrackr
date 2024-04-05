import { FastifyReply, FastifyRequest } from 'fastify';
import { UserModel } from '../types/models/user';
import { getUserFromDb } from '../../database/user';
import { transformUserDto } from '../utils/transformers';
import { UserDto } from '../types/dtos/user';

export const getUser = async (
  req: FastifyRequest<{ Params: { id: number } }>,
  reply: FastifyReply
) => {
  const { id } = req.params;

  try {
    const result = await getUserFromDb(id);

    const userDto =
      Array.isArray(result) && result.length > 0 ? result[0] : null;

    if (!userDto) reply.status(400).send({ message: 'User not found' });

    reply.send(transformUserDto(userDto as UserDto));
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ message: 'Internal server error' });
  }
};

export const postUser = (
  req: FastifyRequest<{ Body: UserModel }>,
  reply: FastifyReply
) => {
  const { address, businessNumber, businessType, name, type, email } = req.body;
};

export const updateUser = (
  req: FastifyRequest<{ Params: { id: number } }>,
  reply: FastifyReply
) => {
  const { id } = req.params;
};

export const deleteUser = (
  req: FastifyRequest<{ Params: { id: number } }>,
  reply: FastifyReply
) => {
  const { id } = req.params;
};
