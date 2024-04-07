import fastify from 'fastify';
import dotenv from 'dotenv';

import cors from '@fastify/cors';

import { getPgVersion } from '../database/db';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { clientRoutes, invoiceRoutes, userRoutes } from './routes';
import setupOnSendHook from './utils/setupOnSendHook';

dotenv.config();

const port = parseInt(process.env.PORT);
const server = fastify().withTypeProvider<TypeBoxTypeProvider>();

setupOnSendHook(server);
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
