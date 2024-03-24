import cors from '@fastify/cors';
import fastify from 'fastify';
import dotenv from 'dotenv';

import { InvoiceModel } from './types/models/invoice';
import { invoices } from './data';

dotenv.config();
const port = parseInt(process.env.PORT);
const server = fastify();
server.register(cors);

server.get<{ Reply: Array<InvoiceModel> }>(
  '/api/invoices',
  async (request, reply) => {
    return invoices;
  }
);

server.listen({ port }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
