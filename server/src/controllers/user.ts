import { FastifyReply, FastifyRequest } from 'fastify';
import { UserModel } from '../types/models';
import { getUserFromDb, updateUserInDb } from '../database';
import { UserDto } from '../types/dtos';
import { transformUserDto } from '../types/transformers';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { File } from 'fastify-multer/lib/interfaces';

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

export const updateUser = async (
  req: FastifyRequest<{ Params: { id: number }; Body: UserModel }> & {
    file: File;
  },
  reply: FastifyReply
) => {
  const { id } = req.params;
  const signatureFile = req.file;
  const user = req.body;

  let uploadedSignature: UploadApiResponse;

  if (signatureFile) {
    uploadedSignature = await cloudinary.uploader.upload(
      `data:${signatureFile.mimetype};base64,${signatureFile.buffer.toString(
        'base64'
      )}`
    );

    if (!uploadedSignature)
      return reply.status(400).send({ message: 'Unable to upload signature' });
  }

  const foundUser = await getUserFromDb(id);

  if (!foundUser) reply.status(400).send({ message: 'User not found' });

  const updatedUser = await updateUserInDb(
    id,
    user,
    signatureFile ? uploadedSignature.url : user.signature
  );

  if (!updatedUser)
    return reply
      .status(400)
      .send({ message: 'Unable to update user information' });

  reply.send({
    user: transformUserDto(updatedUser),
    message: 'User information updated successfully',
  });
};

export const deleteUser = (
  req: FastifyRequest<{ Params: { id: number } }>,
  reply: FastifyReply
) => {
  const { id } = req.params;
};
