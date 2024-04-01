import fastify from 'fastify';
import dotenv from 'dotenv';

import cors from '@fastify/cors';

import invoiceRoutes from './routes/invoice';
import { getPgVersion } from '../database/db';

dotenv.config();

const port = parseInt(process.env.PORT);
const server = fastify();
server.register(cors);

server.register(invoiceRoutes);

getPgVersion();

server.listen({ port }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
