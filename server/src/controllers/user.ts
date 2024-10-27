import bcrypt from 'bcrypt';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { FastifyReply, FastifyRequest } from 'fastify';
import { File } from 'fastify-multer/lib/interfaces';

import {
  deleteUserFromDb,
  getUserByEmailFromDb,
  getUserFromDb,
  registerUser,
  updateUserAccountSettingsInDb,
  updateUserInDb,
  updateUserProfilePictureInDb,
  updateUserSelectedBankAccountInDb,
} from '../database';
import { UserDto } from '../types/dtos';
import { UserModel } from '../types/models';
import { transformUserDto } from '../types/transformers';
import { BadRequestError } from '../utils/errors';

export const getUser = async (
  req: FastifyRequest<{ Params: { id: number } }>,
  reply: FastifyReply
) => {
  const { id } = req.params;

  try {
    const result = await getUserFromDb(id);

    const userDto =
      Array.isArray(result) && result.length > 0 ? result[0] : null;

    if (!userDto) return reply.status(400).send({ message: 'User not found' });

    reply.send(transformUserDto(userDto as UserDto));
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ message: 'Internal server error' });
  }
};

export const getUserByEmail = async (
  req: FastifyRequest<{ Params: { email: string } }>,
  reply: FastifyReply
) => {
  const { email } = req.params;

  try {
    const result = await getUserByEmailFromDb(email);

    const userDto =
      Array.isArray(result) && result.length > 0 ? result[0] : null;

    if (!userDto) return reply.status(400).send({ message: 'User not found' });

    reply.send(transformUserDto(userDto as UserDto));
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ message: 'Internal server error' });
  }
};

export const postUser = async (
  req: FastifyRequest<{
    Body: Pick<UserModel, 'email' | 'password'> & { confirmedPassword: string };
  }>,
  reply: FastifyReply
) => {
  const { email, password, confirmedPassword } = req.body;

  if (password !== confirmedPassword)
    throw new BadRequestError('Passwords do not match');

  const [user] = await getUserByEmailFromDb(email);

  if (user) throw new BadRequestError('User already exists');

  const hashedPassword = await bcrypt.hash(password, 10);

  const createdUser = await registerUser({ email, password: hashedPassword });

  if (!createdUser) throw new BadRequestError('Unable to create user');

  return reply
    .status(201)
    .send({ email, message: 'User created successfully' });
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

  if (!foundUser) return reply.status(400).send({ message: 'User not found' });

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

export const deleteUser = async (
  req: FastifyRequest<{ Params: { id: number } }>,
  reply: FastifyReply
) => {
  const { id } = req.params;

  const deletedUserId = await deleteUserFromDb(id);

  if (!deletedUserId)
    throw BadRequestError(
      'Unable to delete account at this time. Please try again later'
    );

  return reply.status(200).send({ message: 'Account deleted successfully' });
};

export const updateUserSelectedBankAccount = async (
  req: FastifyRequest<{
    Params: { id: number };
    Body: { selectedBankAccountId: number };
  }>,
  reply: FastifyReply
) => {
  const { id } = req.params;
  const { selectedBankAccountId } = req.body;

  const foundUser = await getUserFromDb(id);

  if (!foundUser) return reply.status(400).send({ message: 'User not found' });

  const updatedUserSelectedBankAccount =
    await updateUserSelectedBankAccountInDb(id, selectedBankAccountId);

  if (!updatedUserSelectedBankAccount)
    return reply
      .status(400)
      .send({ message: 'Unable to update user bank account selection' });

  reply.send({
    message: 'User bank account selection updated successfully',
  });
};

export const updateUserProfilePicture = async (
  req: FastifyRequest<{ Params: { id: number } }> & { file: File },
  reply: FastifyReply
) => {
  const { id } = req.params;
  const profilePicture = req.file;

  let uploadedProfilePicture: UploadApiResponse;

  if (profilePicture) {
    uploadedProfilePicture = await cloudinary.uploader.upload(
      `data:${profilePicture.mimetype};base64,${profilePicture.buffer.toString(
        'base64'
      )}`
    );

    if (!uploadedProfilePicture)
      return reply
        .status(400)
        .send({ message: 'Unable to upload profile picture' });
  }

  const updatedUser = await updateUserProfilePictureInDb(
    id,
    uploadedProfilePicture.url
  );

  if (!updatedUser)
    return reply
      .status(400)
      .send({ message: 'Unable to update profile picture' });

  reply.send({
    user: transformUserDto(updatedUser),
    message: 'Profile picture updated successfully',
  });
};

export const updateUserAccountSettings = async (
  req: FastifyRequest<{
    Params: { id: number };
    Body: { currency: string; language: string };
  }>,
  reply: FastifyReply
) => {
  const { id } = req.params;
  const { currency, language } = req.body;

  const updatedUser = await updateUserAccountSettingsInDb(
    id,
    language,
    currency
  );

  if (!updatedUser)
    throw new BadRequestError('Unable to update account settings');

  reply.send({ message: 'Account settings updated successfully' });
};
