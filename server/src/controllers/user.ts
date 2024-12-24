import { MultipartFile } from '@fastify/multipart';
import bcrypt from 'bcrypt';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { FastifyReply, FastifyRequest } from 'fastify';
import { useI18n } from 'fastify-i18n';

import {
  changeUserPasswordInDb,
  deleteUserFromDb,
  getUserByEmailFromDb,
  getUserFromDb,
  getUserPasswordHashFromDb,
  registerUser,
  updateUserAccountSettingsInDb,
  updateUserInDb,
  updateUserProfilePictureInDb,
  updateUserSelectedBankAccountInDb,
} from '../database';
import { UserModel } from '../types/models';
import { BadRequestError, NotFoundError } from '../utils/errors';

export const getUser = async (
  req: FastifyRequest<{ Params: { id: number } }>,
  reply: FastifyReply
) => {
  const { id } = req.params;
  const user = await getUserFromDb(id);

  if (!user) throw new BadRequestError('User not found');

  reply.status(200).send(user);
};

export const getUserByEmail = async (
  req: FastifyRequest<{ Params: { email: string } }>,
  reply: FastifyReply
) => {
  const { email } = req.params;
  const user = await getUserByEmailFromDb(email);

  if (!user) throw new BadRequestError('User not found');

  reply.status(200).send(user);
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

  const user = await getUserByEmailFromDb(email);

  if (!!user) throw new BadRequestError('User already exists');

  const hashedPassword = await bcrypt.hash(password, 10);
  const createdUser = await registerUser({ email, password: hashedPassword });

  if (!createdUser) throw new BadRequestError('Unable to create user');

  return reply
    .status(201)
    .send({ email, message: 'User created successfully' });
};

export const updateUser = async (
  req: FastifyRequest<{
    Params: { id: number };
    Body: UserModel & { file: MultipartFile };
  }>,
  reply: FastifyReply
) => {
  const { id } = req.params;
  const file = req.body.file;
  const user = req.body;

  let uploadedSignature: UploadApiResponse;

  if (file) {
    const fileBuffer = await file.toBuffer();

    uploadedSignature = await cloudinary.uploader.upload(
      `data:${file.mimetype};base64,${fileBuffer.toString('base64')}`
    );

    if (!uploadedSignature)
      throw new BadRequestError('Unable to upload signature');
  }

  const foundUser = await getUserFromDb(id);

  if (!foundUser) throw new NotFoundError('User not found');

  const updatedUser = await updateUserInDb(
    id,
    user,
    file ? uploadedSignature.url : user.signature
  );

  if (!updatedUser)
    throw new BadRequestError('Unable to update user information');

  reply.status(200).send({
    user: updatedUser,
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
    throw new BadRequestError(
      'Unable to delete account at this time. Please try again later'
    );

  reply.status(200).send({ message: 'Account deleted successfully' });
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
    throw new BadRequestError('Unable to update user bank account selection');

  reply.status(200).send({
    message: 'User bank account selection updated successfully',
  });
};

export const updateUserProfilePicture = async (
  req: FastifyRequest<{ Params: { id: number } }> & { file: File },
  reply: FastifyReply
) => {
  const { id } = req.params;
  const profilePicture = await req.file();

  let uploadedProfilePicture: UploadApiResponse;

  if (profilePicture) {
    const profilePictureBuffer = await profilePicture.toBuffer();

    uploadedProfilePicture = await cloudinary.uploader.upload(
      `data:${profilePicture.mimetype};base64,${profilePictureBuffer.toString(
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
    throw new BadRequestError('Unable to update profile picture');

  reply.status(200).send({
    user: updatedUser,
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
  const i18n = await useI18n(req);

  const updatedUser = await updateUserAccountSettingsInDb(
    id,
    language,
    currency
  );

  if (!updatedUser)
    throw new BadRequestError('errors.user.accountSettings.update.badRequest');

  reply
    .status(200)
    .send({ message: i18n.t('errors.user.accountSettings.update.success') });
};

export const changeUserPassword = async (
  req: FastifyRequest<{
    Params: { id: number };
    Body: {
      password: string;
      newPassword: string;
      confirmedNewPassword: string;
    };
  }>,
  reply: FastifyReply
) => {
  const { id } = req.params;
  const { password, newPassword, confirmedNewPassword } = req.body;
  const i18n = await useI18n(req);

  if (newPassword !== confirmedNewPassword)
    throw new BadRequestError(
      i18n.t('errors.user.changePassword.newAndConfirmed')
    );

  const currentPasswordHash = await getUserPasswordHashFromDb(id);
  const isPasswordValid = await bcrypt.compare(password, currentPasswordHash);

  if (!isPasswordValid)
    throw new BadRequestError(
      i18n.t('errors.user.changePassword.currentPassword')
    );

  const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  const changedPassword = await changeUserPasswordInDb(id, hashedNewPassword);

  if (!changedPassword)
    throw new BadRequestError(i18n.t('errors.user.changePassword.badRequest'));

  reply
    .status(200)
    .send({ message: i18n.t('errors.user.changePassword.success') });
};
