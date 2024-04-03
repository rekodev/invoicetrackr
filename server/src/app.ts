import fastify from 'fastify';
import dotenv from 'dotenv';

import cors from '@fastify/cors';

import invoiceRoutes from './routes/invoice';
import { getPgVersion } from '../database/db';
import clientRoutes from './routes/client';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';

dotenv.config();

const port = parseInt(process.env.PORT);
const server = fastify().withTypeProvider<TypeBoxTypeProvider>();
server.register(cors);

server.register(invoiceRoutes);
server.register(clientRoutes);

getPgVersion();

server.listen({ port }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
