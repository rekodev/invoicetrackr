import cors from '@fastify/cors';
import dotenv from 'dotenv';
import fastify from 'fastify';
import fastifyCookie from '@fastify/cookie';
import fastifyMultipart from '@fastify/multipart';
import fastifyRateLimit from '@fastify/rate-limit';
import { defineI18n } from 'fastify-i18n';
import { v2 as cloudinary } from 'cloudinary';

import bankingInformationRoutes from './routes/banking-information';
import clientRoutes from './routes/client';
import contactRoutes from './routes/contact';
import invoiceRoutes from './routes/invoice';
import paymentRoutes from './routes/payment';
import userRoutes from './routes/user';
import i18n from './plugins/i18n';
import { cloudinaryConfig } from './config/cloudinary';
import { errorHandler } from './utils/error';
import { getPgVersion } from './database/db';
import { languageMiddleware } from './middleware/language';
import { rateLimitPluginOptions } from './utils/rate-limit';
import { bankAccountSchema } from './types/banking-information';
import {
  serializerCompiler,
  validatorCompiler
} from 'fastify-type-provider-zod';

dotenv.config();
cloudinary.config(cloudinaryConfig);

const port = parseInt(process.env.SERVER_PORT!);
const server = fastify({
  ajv: {
    customOptions: {
      allErrors: true
    },
    plugins: [require('ajv-errors')]
  },
  logger: {
    level: 'info',
    serializers: {
      req: (req) => ({
        method: req.method,
        url: req.url,
        headers: {
          host: req.headers.host,
          userAgent: req.headers['user-agent'],
          referer: req.headers['referer'],
          xRealIp: req.headers['x-real-ip'],
          xForwardedFor: req.headers['x-forwarded-for']
        },
        remoteAddress: req.ip,
        remotePort: req.socket?.remotePort
      }),
      res: (res) => ({
        statusCode: res.statusCode
      })
    }
  },
  trustProxy: true
});

// Register Plugins
defineI18n(server, {
  en: import('./locales/en'),
  lt: import('./locales/lt')
});
server.register(i18n);
server.register(cors);
server.register(fastifyMultipart);
server.register(fastifyCookie);
server.register(fastifyRateLimit, rateLimitPluginOptions);

// Register Middleware and Error Handler
server.addHook('onRequest', languageMiddleware);
server.setErrorHandler(errorHandler);

server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);

// Register Routes
server.register(invoiceRoutes);
server.register(clientRoutes);
server.register(userRoutes);
server.register(bankingInformationRoutes);
server.register(paymentRoutes);
server.register(contactRoutes);

getPgVersion();

server.listen({ port }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
