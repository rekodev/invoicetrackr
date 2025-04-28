import { Type } from "@sinclair/typebox";
import { RouteShorthandOptionsWithHandler } from "fastify";

import { createCustomer, createSubscription } from "../controllers/payment";

export const createCustomerOptions: RouteShorthandOptionsWithHandler = {
  schema: {
    response: {
      200: { customerId: Type.String() },
    },
  },
  handler: createCustomer,
};

export const createSubscriptionOptions: RouteShorthandOptionsWithHandler = {
  handler: createSubscription,
};
