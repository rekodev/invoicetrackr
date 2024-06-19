import fastify from 'fastify';
import dotenv from 'dotenv';

import cors from '@fastify/cors';

import { getPgVersion } from './database/db';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { clientRoutes, invoiceRoutes, userRoutes } from './routes';

dotenv.config();

const port = parseInt(process.env.PORT);
const server = fastify({
  ajv: {
    customOptions: {
      allErrors: true,
    },
    plugins: [require('ajv-errors')],
  },
}).withTypeProvider<TypeBoxTypeProvider>();

server.setErrorHandler(function (error, _request, reply) {
  if (error.validation) {
    return reply.status(400).send({
      message: 'There are some validation errors',
      errors: error.validation.map((err) => ({
        key: err.instancePath.substring(1),
        value: err.message,
      })),
    });
  }

  return reply.status(500).send(error);
});

server.register(cors);
server.register(invoiceRoutes);
server.register(clientRoutes);
server.register(userRoutes);

getPgVersion();

server.listen({ port }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
