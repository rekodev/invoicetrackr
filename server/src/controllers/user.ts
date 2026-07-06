import {
  type AccountSettingsBody,
  OAuthUserBody,
  UserBody,
  UserProfileUpdateBody
} from '@invoicetrackr/types';
import { FastifyReply, FastifyRequest } from 'fastify';
import { ResetPasswordEmail, VerifyEmailEmail } from '@invoicetrackr/emails';
import { UploadApiResponse, v2 as cloudinary } from 'cloudinary';
import { MultipartFile } from '@fastify/multipart';
import bcrypt from 'bcryptjs';
import { useI18n } from 'fastify-i18n';

import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError
} from '../utils/error';
import { appEmailFrom, getAppUrl } from '../config/app';
import {
  changeUserPasswordInDb,
  deleteUserFromDb,
  getUserByEmailFromDb,
  getUserEmailVerificationStatusFromDb,
  getUserFromDb,
  getUserPasswordHashFromDb,
  getUserResetPasswordTokenFromDb,
  invalidateTokenInDb,
  registerUser,
  updateUserAccountSettingsInDb,
  updateUserAnalyticsConsentInDb,
  updateUserInDb,
  updateUserProfilePictureInDb,
  updateUserSelectedBankAccountInDb,
  verifyUserEmailInDb
} from '../database/user';
import {
  getEmailVerificationTokenFromDb,
  getLatestEmailVerificationTokenForUserFromDb,
  markEmailVerificationTokenUsedInDb,
  saveEmailVerificationTokenToDb
} from '../database/email-verification';
import { ANALYTICS_CONSENT_COOKIE } from '../analytics/constants';
import { analyticsEvents } from '../analytics/events';
import { captureAnalyticsEventForUser } from '../analytics/posthog';
import { resend } from '../config/resend';
import { saveResetTokenToDb } from '../database/password-reset';

const EMAIL_VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const EMAIL_VERIFICATION_RESEND_COOLDOWN_MS = 15 * 60 * 1000;

const createEmailVerificationToken = async (userId: number) => {
  const token = crypto.randomUUID();
  const expiresAt = new Date(
    Date.now() + EMAIL_VERIFICATION_TOKEN_TTL_MS
  ).toISOString();

  await saveEmailVerificationTokenToDb(userId, token, expiresAt);

  return token;
};

const sendVerificationEmail = async ({
  email,
  token,
  i18n
}: {
  email: string;
  token: string;
  i18n: Awaited<ReturnType<typeof useI18n>>;
}) => {
  const verificationLink = getAppUrl(`/verify-email/${token}`);
  const emailHtml = VerifyEmailEmail({
    verificationLink,
    translations: {
      subject: i18n.t('emails.verifyEmail.subject'),
      greeting: i18n.t('emails.verifyEmail.greeting'),
      message: i18n.t('emails.verifyEmail.message'),
      buttonText: i18n.t('emails.verifyEmail.buttonText'),
      orCopy: i18n.t('emails.verifyEmail.orCopy'),
      linkExpiry: i18n.t('emails.verifyEmail.linkExpiry'),
      noRequest: i18n.t('emails.verifyEmail.noRequest'),
      footer: i18n.t('emails.verifyEmail.footer'),
      copyright: i18n.t('emails.verifyEmail.copyright', {
        year: new Date().getFullYear()
      })
    }
  });

  const { error } = await resend.emails.send({
    from: appEmailFrom,
    to: [email],
    subject: i18n.t('emails.verifyEmail.subject'),
    react: emailHtml,
    text: i18n.t('emails.verifyEmail.text', { verificationLink })
  });

  if (error) {
    console.error({ error });
    throw new BadRequestError(
      i18n.t('error.user.unableToSendVerificationEmail')
    );
  }
};

export const getUser = async (
  req: FastifyRequest<{ Params: { userId: string } }>,
  reply: FastifyReply
) => {
  const userId = Number(req.params.userId);
  const i18n = await useI18n(req);
  const user = await getUserFromDb(userId);

  if (!user) throw new BadRequestError(i18n.t('error.user.notFound'));

  reply.status(200).send({ user });
};

export const loginUser = async (
  req: FastifyRequest<{ Body: { email: string; password: string } }>,
  reply: FastifyReply
) => {
  const { email, password } = req.body;
  const i18n = await useI18n(req);
  const user = await getUserByEmailFromDb(email);

  if (!user)
    throw new UnauthorizedError(i18n.t('error.user.invalidCredentials'));

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword)
    throw new UnauthorizedError(i18n.t('error.user.invalidCredentials'));

  reply.status(200).send({
    user,
    message: i18n.t('success.user.loggedIn')
  });
};

export const postUser = async (
  req: FastifyRequest<{
    Body: Pick<UserBody, 'email' | 'password'> & { confirmedPassword: string };
  }>,
  reply: FastifyReply
) => {
  const { email, password, confirmedPassword } = req.body;
  const i18n = await useI18n(req);
  const languageHeader = req.headers['accept-language'];
  const requestedLanguage = Array.isArray(languageHeader)
    ? languageHeader.at(0)
    : languageHeader;
  const language = requestedLanguage?.startsWith('lt') ? 'lt' : 'en';
  const analyticsConsentStatus =
    req.cookies?.[ANALYTICS_CONSENT_COOKIE] === 'accepted' ? 'accepted' : null;

  if (!email) throw new BadRequestError(i18n.t('validation.user.email'));

  if (password !== confirmedPassword)
    throw new BadRequestError(i18n.t('error.user.passwordsDoNotMatch'));

  const user = await getUserByEmailFromDb(email || '');

  if (!!user) throw new BadRequestError(i18n.t('error.user.alreadyExists'));

  const hashedPassword = await bcrypt.hash(password, 10);
  const createdUser = await registerUser({
    email,
    password: hashedPassword,
    language,
    analyticsConsentStatus
  });

  if (!createdUser)
    throw new BadRequestError(i18n.t('error.user.unableToCreate'));

  try {
    const verificationToken = await createEmailVerificationToken(
      createdUser.id
    );
    await sendVerificationEmail({ email, token: verificationToken, i18n });
  } catch (error) {
    req.log.error({ error, email }, 'Unable to send verification email');
  }

  await captureAnalyticsEventForUser({
    userId: createdUser.id,
    event: analyticsEvents.signUpCompleted,
    properties: { method: 'email', language }
  });

  return reply
    .status(201)
    .send({ email, message: i18n.t('success.user.created') });
};

export const postOAuthUser = async (
  req: FastifyRequest<{ Body: OAuthUserBody }>,
  reply: FastifyReply
) => {
  const { email, name, image, provider, emailVerified } = req.body;
  const i18n = await useI18n(req);
  const languageHeader = req.headers['accept-language'];
  const requestedLanguage = Array.isArray(languageHeader)
    ? languageHeader.at(0)
    : languageHeader;
  const language = requestedLanguage?.startsWith('lt') ? 'lt' : 'en';
  const analyticsConsentStatus =
    req.cookies?.[ANALYTICS_CONSENT_COOKIE] === 'accepted' ? 'accepted' : null;

  if (provider !== 'google' || !emailVerified) {
    throw new UnauthorizedError(i18n.t('error.user.oauthEmailNotVerified'));
  }

  const existingUser = await getUserByEmailFromDb(email);

  if (existingUser) {
    if (!existingUser.emailVerifiedAt) {
      await verifyUserEmailInDb(existingUser.id);
    }

    const user = await getUserFromDb(existingUser.id);

    if (!user) throw new BadRequestError(i18n.t('error.user.notFound'));

    return reply.status(200).send({
      user,
      message: i18n.t('success.user.oauthLinked')
    });
  }

  const generatedPassword = await bcrypt.hash(crypto.randomUUID(), 10);
  const createdUser = await registerUser({
    email,
    password: generatedPassword,
    language,
    name: name || '',
    profilePictureUrl: image || '',
    emailVerifiedAt: new Date().toISOString(),
    analyticsConsentStatus
  });

  if (!createdUser)
    throw new BadRequestError(i18n.t('error.user.unableToCreate'));

  const user = await getUserFromDb(createdUser.id);

  if (!user) throw new BadRequestError(i18n.t('error.user.notFound'));

  await captureAnalyticsEventForUser({
    userId: createdUser.id,
    event: analyticsEvents.signUpCompleted,
    properties: { method: 'google', language }
  });

  return reply.status(201).send({
    user,
    message: i18n.t('success.user.oauthLinked')
  });
};

export const updateUser = async (
  req: FastifyRequest<{
    Params: { userId: string };
    Body: UserProfileUpdateBody & { file?: MultipartFile };
  }>,
  reply: FastifyReply
) => {
  const userId = Number(req.params.userId);
  const file = req.body.file;
  const {
    email,
    name,
    businessType,
    businessNumber,
    vatNumber,
    address,
    isVatPayer,
    signature
  } = req.body;
  const i18n = await useI18n(req);

  let uploadedSignature: UploadApiResponse | undefined;

  if (file) {
    const fileBuffer = await file.toBuffer();

    uploadedSignature = await cloudinary.uploader.upload(
      `data:${file.mimetype};base64,${fileBuffer.toString('base64')}`
    );

    if (!uploadedSignature)
      throw new BadRequestError(i18n.t('error.user.unableToUploadSignature'));
  }

  const foundUser = await getUserFromDb(userId);

  if (!foundUser) throw new NotFoundError(i18n.t('error.user.notFound'));

  const signatureUrl = uploadedSignature?.url
    ? uploadedSignature.url.replace('http://', 'https://')
    : signature;
  const shouldResetEmailVerification = foundUser.email !== email;

  if (shouldResetEmailVerification && !foundUser.emailVerifiedAt) {
    throw new ForbiddenError(i18n.t('error.user.emailVerificationRequired'));
  }

  const updatedUser = await updateUserInDb(
    {
      id: userId,
      email,
      name,
      businessType,
      businessNumber,
      vatNumber,
      isVatPayer,
      address
    },
    signatureUrl || '',
    shouldResetEmailVerification
  );

  if (!updatedUser)
    throw new BadRequestError(i18n.t('error.user.unableToUpdate'));

  if (shouldResetEmailVerification) {
    const verificationToken = await createEmailVerificationToken(userId);
    await sendVerificationEmail({ email, token: verificationToken, i18n });
  }

  if (!foundUser.onboardingCompletedAt) {
    await captureAnalyticsEventForUser({
      userId,
      event: analyticsEvents.onboardingStepCompleted,
      properties: { step: 'business_profile' }
    });
  }

  reply.status(200).send({
    user: updatedUser,
    message: i18n.t('success.user.updated')
  });
};

export const deleteUser = async (
  req: FastifyRequest<{ Params: { userId: string } }>,
  reply: FastifyReply
) => {
  const userId = Number(req.params.userId);
  const i18n = await useI18n(req);

  const deletedUserId = await deleteUserFromDb(userId);

  if (!deletedUserId)
    throw new BadRequestError(i18n.t('error.user.unableToDelete'));

  reply.status(200).send({ message: i18n.t('success.user.deleted') });
};

export const updateUserSelectedBankAccount = async (
  req: FastifyRequest<{
    Params: { userId: string };
    Body: { selectedBankAccountId: number };
  }>,
  reply: FastifyReply
) => {
  const userId = Number(req.params.userId);
  const { selectedBankAccountId } = req.body;
  const i18n = await useI18n(req);

  const foundUser = await getUserFromDb(userId);

  if (!foundUser) throw new NotFoundError(i18n.t('error.user.notFound'));

  const updatedUserSelectedBankAccount =
    await updateUserSelectedBankAccountInDb(userId, selectedBankAccountId);

  if (!updatedUserSelectedBankAccount)
    throw new BadRequestError(
      i18n.t('error.user.unableToUpdateSelectedBankAccount')
    );

  reply.status(200).send({
    message: i18n.t('success.user.selectedBankAccountUpdated')
  });
};

export const updateUserAnalyticsConsent = async (
  req: FastifyRequest<{
    Params: { userId: string };
    Body: Pick<UserBody, 'analyticsConsentStatus'>;
  }>,
  reply: FastifyReply
) => {
  const userId = Number(req.params.userId);
  const { analyticsConsentStatus } = req.body;
  const i18n = await useI18n(req);

  if (!analyticsConsentStatus)
    throw new BadRequestError(i18n.t('error.user.unableToUpdate'));

  const user = await updateUserAnalyticsConsentInDb(
    userId,
    analyticsConsentStatus
  );

  if (!user) throw new BadRequestError(i18n.t('error.user.unableToUpdate'));

  reply.status(200).send({ user, message: i18n.t('success.user.updated') });
};

export const updateUserProfilePicture = async (
  req: FastifyRequest<{ Params: { userId: string } }> & { file: File },
  reply: FastifyReply
) => {
  const userId = Number(req.params.userId);
  const profilePicture = await req.file();
  const i18n = await useI18n(req);

  let uploadedProfilePicture: UploadApiResponse | undefined;

  if (profilePicture) {
    const profilePictureBuffer = await profilePicture.toBuffer();

    uploadedProfilePicture = await cloudinary.uploader.upload(
      `data:${profilePicture.mimetype};base64,${profilePictureBuffer.toString(
        'base64'
      )}`
    );

    if (!uploadedProfilePicture)
      throw new BadRequestError(
        i18n.t('error.user.unableToUpdateProfilePicture')
      );
  }

  const urlWithHttps = uploadedProfilePicture?.url.replace(
    'http://',
    'https://'
  );

  const updatedUser = await updateUserProfilePictureInDb(
    userId,
    urlWithHttps || ''
  );

  if (!updatedUser)
    throw new BadRequestError(
      i18n.t('error.user.unableToUpdateProfilePicture')
    );

  reply.status(200).send({
    user: updatedUser,
    message: i18n.t('success.user.profilePictureUpdated')
  });
};

export const updateUserAccountSettings = async (
  req: FastifyRequest<{
    Params: { userId: string };
    Body: AccountSettingsBody;
  }>,
  reply: FastifyReply
) => {
  const userId = Number(req.params.userId);
  const {
    currency,
    language,
    preferredInvoiceLanguage,
    isVatPayer,
    defaultInvoiceVatMode,
    defaultInvoiceSeries,
    defaultPaymentTermsDays
  } = req.body;
  const i18n = await useI18n(req);

  const updatedUser = await updateUserAccountSettingsInDb(
    userId,
    language,
    currency,
    preferredInvoiceLanguage,
    isVatPayer,
    defaultInvoiceVatMode,
    defaultInvoiceSeries,
    defaultPaymentTermsDays
  );

  if (!updatedUser)
    throw new BadRequestError('errors.user.accountSettings.update.badRequest');

  reply
    .status(200)
    .send({ message: i18n.t('success.user.accountSettingsUpdated') });
};

export const changeUserPassword = async (
  req: FastifyRequest<{
    Params: { userId: string };
    Body: {
      password: string;
      newPassword: string;
      confirmedNewPassword: string;
    };
  }>,
  reply: FastifyReply
) => {
  const userId = Number(req.params.userId);
  const { password, newPassword, confirmedNewPassword } = req.body;
  const i18n = await useI18n(req);

  if (newPassword !== confirmedNewPassword)
    throw new BadRequestError(i18n.t('error.user.passwordsDoNotMatch'));

  const currentPasswordHash = await getUserPasswordHashFromDb(userId);

  if (!currentPasswordHash)
    throw new NotFoundError(i18n.t('error.user.notFound'));

  const isPasswordValid = await bcrypt.compare(password, currentPasswordHash);

  if (!isPasswordValid)
    throw new BadRequestError(i18n.t('error.user.currentPasswordIncorrect'));

  const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  const changedPassword = await changeUserPasswordInDb(
    userId,
    hashedNewPassword
  );

  if (!changedPassword)
    throw new BadRequestError(i18n.t('error.user.unableToChangePassword'));

  reply.status(200).send({ message: i18n.t('success.user.passwordChanged') });
};

export const resetUserPassword = async (
  req: FastifyRequest<{ Body: { email: string } }>,
  reply: FastifyReply
) => {
  const { email } = req.body;
  const user = await getUserByEmailFromDb(email);
  const i18n = await useI18n(req);

  if (!user) throw new NotFoundError(i18n.t('error.user.notFound'));

  const resetToken = crypto.randomUUID();
  const tokenExpiresAt = new Date(Date.now() + 3600000).toISOString();

  await saveResetTokenToDb(user.id, resetToken, tokenExpiresAt);

  const resetLink = getAppUrl(`/create-new-password/${resetToken}`);

  const emailHtml = ResetPasswordEmail({
    resetLink,
    translations: {
      subject: i18n.t('emails.resetPassword.subject'),
      greeting: i18n.t('emails.resetPassword.greeting'),
      message: i18n.t('emails.resetPassword.message'),
      buttonText: i18n.t('emails.resetPassword.buttonText'),
      orCopy: i18n.t('emails.resetPassword.orCopy'),
      linkExpiry: i18n.t('emails.resetPassword.linkExpiry'),
      noRequest: i18n.t('emails.resetPassword.noRequest'),
      footer: i18n.t('emails.resetPassword.footer'),
      copyright: i18n.t('emails.resetPassword.copyright', {
        year: new Date().getFullYear()
      })
    }
  });

  const { error } = await resend.emails.send({
    from: appEmailFrom,
    to: [email],
    subject: i18n.t('emails.resetPassword.subject'),
    react: emailHtml,
    text: i18n.t('emails.resetPassword.text', { resetLink })
  });

  if (error) {
    console.error({ error });
    throw new BadRequestError(i18n.t('error.user.unableToSendResetLink'));
  }

  reply.status(200).send({ message: i18n.t('success.user.resetLinkSent') });
};

export const verifyUserEmail = async (
  req: FastifyRequest<{ Params: { token: string } }>,
  reply: FastifyReply
) => {
  const { token } = req.params;
  const i18n = await useI18n(req);
  const tokenFromDb = await getEmailVerificationTokenFromDb(token);

  if (!tokenFromDb)
    throw new BadRequestError(i18n.t('error.user.tokenInvalid'));

  const user = await getUserEmailVerificationStatusFromDb(tokenFromDb.userId);

  if (!user) throw new BadRequestError(i18n.t('error.user.tokenInvalid'));

  if (user.emailVerifiedAt) {
    if (!tokenFromDb.usedAt) await markEmailVerificationTokenUsedInDb(token);

    return reply.status(200).send({
      status: 'already_verified',
      emailVerifiedAt: user.emailVerifiedAt,
      message: i18n.t('success.user.emailAlreadyVerified')
    });
  }

  if (tokenFromDb.usedAt)
    throw new BadRequestError(i18n.t('error.user.tokenAlreadyUsed'));

  const currentDate = new Date();
  const tokenExpirationDate = new Date(tokenFromDb.expiresAt);

  if (currentDate > tokenExpirationDate)
    throw new BadRequestError(i18n.t('error.user.tokenExpired'));

  const verifiedUser = await verifyUserEmailInDb(tokenFromDb.userId);

  if (!verifiedUser)
    throw new BadRequestError(i18n.t('error.user.tokenInvalid'));

  await markEmailVerificationTokenUsedInDb(token);

  reply.status(200).send({
    status: 'verified',
    emailVerifiedAt: verifiedUser.emailVerifiedAt,
    message: i18n.t('success.user.emailVerified')
  });
};

export const resendUserVerificationEmail = async (
  req: FastifyRequest<{ Params: { userId: string } }>,
  reply: FastifyReply
) => {
  const userId = Number(req.params.userId);
  const i18n = await useI18n(req);
  const user = await getUserEmailVerificationStatusFromDb(userId);

  if (!user) throw new NotFoundError(i18n.t('error.user.notFound'));

  if (user.emailVerifiedAt) {
    return reply
      .status(200)
      .send({ message: i18n.t('success.user.emailAlreadyVerified') });
  }

  const latestToken =
    await getLatestEmailVerificationTokenForUserFromDb(userId);
  const lastSentAt = latestToken?.lastSentAt
    ? new Date(latestToken.lastSentAt)
    : null;

  if (
    lastSentAt &&
    Date.now() - lastSentAt.getTime() < EMAIL_VERIFICATION_RESEND_COOLDOWN_MS
  ) {
    throw new BadRequestError(i18n.t('error.user.emailVerificationCooldown'));
  }

  const verificationToken = await createEmailVerificationToken(userId);
  await sendVerificationEmail({
    email: user.email,
    token: verificationToken,
    i18n
  });

  reply
    .status(200)
    .send({ message: i18n.t('success.user.verificationEmailSent') });
};

export const getUserResetPasswordToken = async (
  req: FastifyRequest<{ Params: { token: string } }>,
  reply: FastifyReply
) => {
  const { token } = req.params;
  const i18n = await useI18n(req);
  const tokenFromDb = await getUserResetPasswordTokenFromDb(token);

  if (!tokenFromDb)
    throw new BadRequestError(i18n.t('error.user.tokenInvalid'));

  const currentDate = new Date();
  const tokenExpirationDate = new Date(tokenFromDb.expiresAt);

  if (currentDate > tokenExpirationDate)
    throw new BadRequestError(i18n.t('error.user.tokenExpired'));

  reply.status(200).send(tokenFromDb);
};

export const createNewUserPassword = async (
  req: FastifyRequest<{
    Params: { userId: string };
    Body: { token: string; newPassword: string; confirmedNewPassword: string };
  }>,
  reply: FastifyReply
) => {
  const userId = Number(req.params.userId);
  const { newPassword, confirmedNewPassword, token } = req.body;
  const i18n = await useI18n(req);

  if (newPassword !== confirmedNewPassword)
    throw new BadRequestError(i18n.t('error.user.passwordsDoNotMatch'));

  const tokenFromDb = await getUserResetPasswordTokenFromDb(token);

  if (!token || !tokenFromDb)
    throw new BadRequestError(i18n.t('error.user.tokenInvalid'));

  const currentDate = new Date();
  const tokenExpirationDate = new Date(tokenFromDb.expiresAt);

  if (currentDate > tokenExpirationDate)
    throw new BadRequestError(i18n.t('error.user.tokenExpired'));

  const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  const changedPassword = await changeUserPasswordInDb(
    userId,
    hashedNewPassword
  );

  if (!changedPassword)
    throw new BadRequestError(i18n.t('error.user.unableToChangePassword'));

  await invalidateTokenInDb(userId, token);

  reply.status(200).send({ message: i18n.t('success.user.passwordChanged') });
};
