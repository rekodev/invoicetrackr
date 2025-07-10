import { MultipartFile } from '@fastify/multipart';
import bcrypt from 'bcryptjs';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { FastifyReply, FastifyRequest } from 'fastify';
import { useI18n } from 'fastify-i18n';

import {
  changeUserPasswordInDb,
  deleteUserFromDb,
  getUserByEmailFromDb,
  getUserFromDb,
  getUserPasswordHashFromDb,
  getUserResetPasswordTokenFromDb,
  invalidateTokenInDb,
  registerUser,
  updateUserAccountSettingsInDb,
  updateUserInDb,
  updateUserProfilePictureInDb,
  updateUserSelectedBankAccountInDb
} from '../database';
import { UserModel } from '../types/models';
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError
} from '../utils/errors';
import { saveResetTokenToDb } from '../database/password-reset';
import { resend } from '../config/resend';
import { stripe } from '../config/stripe';
import { getStripeCustomerIdFromDb } from '../database/payment';

export const getUser = async (
  req: FastifyRequest<{ Params: { userId: number } }>,
  reply: FastifyReply
) => {
  const { userId } = req.params;
  const user = await getUserFromDb(userId);

  if (!user) throw new BadRequestError('User not found');

  reply.status(200).send(user);
};

export const loginUser = async (
  req: FastifyRequest<{ Body: { email: string; password: string } }>,
  reply: FastifyReply
) => {
  const { email, password } = req.body;
  const user = await getUserByEmailFromDb(email);

  if (!user) throw new UnauthorizedError('Invalid credentials');

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) throw new UnauthorizedError('Invalid credentials');

  let isSubscriptionActive = false;

  if (!!user.stripeSubscriptionId) {
    try {
      const userSubscription = await stripe.subscriptions.retrieve(
        user.stripeSubscriptionId
      );

      if (userSubscription?.status === 'active') isSubscriptionActive = true;
    } catch (e) {
      console.error(e);
    }
  }

  reply.status(200).send({
    user: { ...user, isSubscriptionActive }
  });
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
    Params: { userId: number };
    Body: UserModel & { file: MultipartFile };
  }>,
  reply: FastifyReply
) => {
  const { userId } = req.params;
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

  const foundUser = await getUserFromDb(userId);

  if (!foundUser) throw new NotFoundError('User not found');

  const signatureUrl = uploadedSignature?.url
    ? uploadedSignature.url.replace('http://', 'https://')
    : user.signature;

  const updatedUser = await updateUserInDb(user, signatureUrl);

  if (!updatedUser)
    throw new BadRequestError('Unable to update user information');

  reply.status(200).send({
    user: updatedUser,
    message: 'User information updated successfully'
  });
};

export const deleteUser = async (
  req: FastifyRequest<{ Params: { userId: number } }>,
  reply: FastifyReply
) => {
  const { userId } = req.params;

  const stripeCustomerId = await getStripeCustomerIdFromDb(userId);
  await stripe.customers.del(stripeCustomerId);

  const deletedUserId = await deleteUserFromDb(userId);

  if (!deletedUserId)
    throw new BadRequestError(
      'Unable to delete account at this time. Please try again later'
    );

  reply.status(200).send({ message: 'Account deleted successfully' });
};

export const updateUserSelectedBankAccount = async (
  req: FastifyRequest<{
    Params: { userId: number };
    Body: { selectedBankAccountId: number };
  }>,
  reply: FastifyReply
) => {
  const { userId } = req.params;
  const { selectedBankAccountId } = req.body;

  const foundUser = await getUserFromDb(userId);

  if (!foundUser) return reply.status(400).send({ message: 'User not found' });

  const updatedUserSelectedBankAccount =
    await updateUserSelectedBankAccountInDb(userId, selectedBankAccountId);

  if (!updatedUserSelectedBankAccount)
    throw new BadRequestError('Unable to update user bank account selection');

  reply.status(200).send({
    message: 'User bank account selection updated successfully'
  });
};

export const updateUserProfilePicture = async (
  req: FastifyRequest<{ Params: { userId: number } }> & { file: File },
  reply: FastifyReply
) => {
  const { userId } = req.params;
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

  const urlWithHttps = uploadedProfilePicture?.url.replace(
    'http://',
    'https://'
  );

  const updatedUser = await updateUserProfilePictureInDb(userId, urlWithHttps);

  if (!updatedUser)
    throw new BadRequestError('Unable to update profile picture');

  reply.status(200).send({
    user: updatedUser,
    message: 'Profile picture updated successfully'
  });
};

export const updateUserAccountSettings = async (
  req: FastifyRequest<{
    Params: { userId: number };
    Body: { currency: string; language: string };
  }>,
  reply: FastifyReply
) => {
  const { userId } = req.params;
  const { currency, language } = req.body;
  const i18n = await useI18n(req);

  const updatedUser = await updateUserAccountSettingsInDb(
    userId,
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
    Params: { userId: number };
    Body: {
      password: string;
      newPassword: string;
      confirmedNewPassword: string;
    };
  }>,
  reply: FastifyReply
) => {
  const { userId } = req.params;
  const { password, newPassword, confirmedNewPassword } = req.body;
  const i18n = await useI18n(req);

  if (newPassword !== confirmedNewPassword)
    throw new BadRequestError(
      i18n.t('errors.user.changePassword.newAndConfirmed')
    );

  const currentPasswordHash = await getUserPasswordHashFromDb(userId);
  const isPasswordValid = await bcrypt.compare(password, currentPasswordHash);

  if (!isPasswordValid)
    throw new BadRequestError(
      i18n.t('errors.user.changePassword.currentPassword')
    );

  const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  const changedPassword = await changeUserPasswordInDb(
    userId,
    hashedNewPassword
  );

  if (!changedPassword)
    throw new BadRequestError(i18n.t('errors.user.changePassword.badRequest'));

  reply
    .status(200)
    .send({ message: i18n.t('errors.user.changePassword.success') });
};

export const resetUserPassword = async (
  req: FastifyRequest<{ Body: { email: string } }>,
  reply: FastifyReply
) => {
  const { email } = req.body;
  const user = await getUserByEmailFromDb(email);
  const i18n = await useI18n(req);

  if (!user)
    throw new NotFoundError(i18n.t('errors.user.resetPassword.notFound'));

  const resetToken = crypto.randomUUID();
  const tokenExpiresAt = new Date(Date.now() + 3600000).toISOString();

  await saveResetTokenToDb(user.id, resetToken, tokenExpiresAt);

  const resetLink = `https://invoicetrackr.app/create-new-password/${resetToken}`;

  const { error } = await resend.emails.send({
    from: 'InvoiceTrackr <noreply@invoicetrackr.app>',
    to: [email],
    subject: i18n.t('emails.resetPassword.subject'),
    text: i18n.t('emails.resetPassword.text', { resetLink })
  });

  if (error) {
    console.error({ error });
    throw new BadRequestError(i18n.t('errors.user.resetPassword.failure'));
  }

  reply
    .status(200)
    .send({ message: i18n.t('errors.user.resetPassword.success') });
};

export const getUserResetPasswordToken = async (
  req: FastifyRequest<{ Params: { token: string } }>,
  reply: FastifyReply
) => {
  const { token } = req.params;
  const tokenFromDb = await getUserResetPasswordTokenFromDb(token);

  if (!tokenFromDb)
    throw new BadRequestError('errors.user.resetPassword.token.invalid');

  const currentDate = new Date();
  const tokenExpirationDate = new Date(tokenFromDb.expiresAt);

  if (currentDate > tokenExpirationDate)
    throw new BadRequestError('errors.user.resetPassword.token.expired');

  reply.status(200).send(tokenFromDb);
};

export const createNewUserPassword = async (
  req: FastifyRequest<{
    Params: { userId: number };
    Body: { token: string; newPassword: string; confirmedNewPassword: string };
  }>,
  reply: FastifyReply
) => {
  const { userId } = req.params;
  const { newPassword, confirmedNewPassword, token } = req.body;
  const i18n = await useI18n(req);

  if (newPassword !== confirmedNewPassword)
    throw new BadRequestError(
      i18n.t('errors.user.changePassword.newAndConfirmed')
    );

  const tokenFromDb = await getUserResetPasswordTokenFromDb(token);

  if (!token || !tokenFromDb)
    throw new BadRequestError(
      i18n.t('errors.user.resetPassword.token.invalid')
    );

  const currentDate = new Date();
  const tokenExpirationDate = new Date(tokenFromDb.expiresAt);

  if (currentDate > tokenExpirationDate)
    throw new BadRequestError(
      i18n.t('errors.user.resetPassword.token.expired')
    );

  const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  const changedPassword = await changeUserPasswordInDb(
    userId,
    hashedNewPassword
  );

  if (!changedPassword)
    throw new BadRequestError(i18n.t('errors.user.changePassword.badRequest'));

  await invalidateTokenInDb(userId, token);

  reply
    .status(200)
    .send({ message: i18n.t('errors.user.changePassword.success') });
};
