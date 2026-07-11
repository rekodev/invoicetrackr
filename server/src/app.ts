import fastifyCookie from '@fastify/cookie';
import cors from '@fastify/cors';
import fastifyMultipart from '@fastify/multipart';
import fastifyRateLimit from '@fastify/rate-limit';
import ajvErrors from 'ajv-errors';
import { v2 as cloudinary } from 'cloudinary';
import fastify from 'fastify';
import { defineI18n } from 'fastify-i18n';
import {
  serializerCompiler,
  validatorCompiler
} from 'fastify-type-provider-zod';

import { cloudinaryConfig } from './config/cloudinary';
import { loadEnv } from './config/env';
import { getPgVersion } from './database/db';
import { languageMiddleware } from './middleware/language';
import i18n from './plugins/i18n';
import bankingInformationRoutes from './routes/banking-information';
import clientRoutes from './routes/client';
import contactRoutes from './routes/contact';
import expenseRoutes from './routes/expense';
import invoiceRoutes from './routes/invoice';
import userRoutes from './routes/user';
import webhookRoutes from './routes/webhook';
import { errorHandler } from './utils/error';
import { rateLimitPluginOptions } from './utils/rate-limit';

loadEnv();
cloudinary.config(cloudinaryConfig);

const port = parseInt(process.env.SERVER_PORT!);
const server = fastify({
  ajv: {
    customOptions: {
      allErrors: true
    },
    plugins: [ajvErrors]
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
  trustProxy: true,
  bodyLimit: 10485760
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
server.register(webhookRoutes);
server.register(invoiceRoutes);
server.register(expenseRoutes);
server.register(clientRoutes);
server.register(userRoutes);
server.register(bankingInformationRoutes);
server.register(contactRoutes);

getPgVersion();

server.listen({ port }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
