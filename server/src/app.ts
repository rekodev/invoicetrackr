import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";

import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import fastify from "fastify";
import { defineI18n, useI18n } from "fastify-i18n";
import cors from "@fastify/cors";
import fastifyMultipart from "@fastify/multipart";

import { cloudinaryConfig } from "./config/cloudinary";
import { getPgVersion } from "./database/db";
import i18n from "./plugins/i18n";
import {
  bankingInformationRoutes,
  clientRoutes,
  invoiceRoutes,
  paymentRoutes,
  userRoutes,
} from "./routes";
import { getTranslationKeyPrefix } from "./utils/url";
import fastifyCookie from "@fastify/cookie";

dotenv.config();
cloudinary.config(cloudinaryConfig);

const port = parseInt(process.env.SERVER_PORT);
const server = fastify({
  ajv: {
    customOptions: {
      allErrors: true,
    },
    plugins: [require("ajv-errors")],
  },
}).withTypeProvider<TypeBoxTypeProvider>();

defineI18n(server, {
  en: import("./locales/en"),
  lt: import("./locales/lt"),
});

server.register(cors);
server.register(fastifyMultipart);
server.register(fastifyCookie);
server.register(invoiceRoutes);
server.register(clientRoutes);
server.register(userRoutes);
server.register(bankingInformationRoutes);
server.register(paymentRoutes);
server.register(i18n);

server.setErrorHandler(async function (error, request, reply) {
  const i18n = useI18n(request);

  if (error.validation) {
    return reply.status(400).send({
      message: "Review fields and retry",
      errors: error.validation.map((err) => {
        const key = err.instancePath.substring(1).replace(/\//g, ".");
        const keyPrefix = getTranslationKeyPrefix(request.url);
        const nonDynamicKeyWithPrefix =
          `validationErrors.${keyPrefix}.${key}`.replace(/\.?\d+/g, "");

        return {
          key,
          value:
            i18n.t(nonDynamicKeyWithPrefix) === nonDynamicKeyWithPrefix
              ? err.message || "Review field"
              : i18n.t(nonDynamicKeyWithPrefix),
        };
      }),
      code: error.code,
    });
  }

  return reply
    .status(error.statusCode || 500)
    .send({ errors: [], message: error.message, code: error.code });
});

getPgVersion();

server.listen({ port }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
