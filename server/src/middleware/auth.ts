import { FastifyRequest } from "fastify";
import { decode } from "next-auth/jwt";
import "dotenv/config";

import { UnauthorizedError } from "../utils/errors";

const AUTH_COOKIE = "authjs.session-token";

export const authMiddleware = async (
  req: FastifyRequest<{ Params: { userId?: string; email?: string } }>,
) => {
  const authToken = req.cookies[AUTH_COOKIE];

  if (!authToken) throw new UnauthorizedError();

  const decodedToken = await decode({
    token: authToken,
    secret: process.env.AUTH_SECRET,
    salt: AUTH_COOKIE,
  });

  if (!decodedToken) {
    throw new UnauthorizedError();
  }

  if (req.params.userId && decodedToken.sub !== req.params.userId) {
    throw new UnauthorizedError();
  }

  if (req.params.email && decodedToken.sub !== req.params.email) {
    throw new UnauthorizedError();
  }
};
