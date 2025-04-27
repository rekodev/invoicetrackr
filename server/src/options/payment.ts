import { Type } from "@sinclair/typebox";
import { RouteShorthandOptionsWithHandler } from "fastify";

import { createPaymentIntent } from "../controllers/payment";

export const createPaymentIntentOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: { clientSecret: Type.String() },
    },
  },
  handler: createPaymentIntent,
};
