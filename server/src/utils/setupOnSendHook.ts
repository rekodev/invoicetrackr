import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

const setupOnSendHook = (fastify: FastifyInstance): void => {
  fastify.addHook(
    'onSend',
    async (
      _request: FastifyRequest,
      reply: FastifyReply,
      payload: string
    ): Promise<string | undefined> => {
      if (reply.statusCode >= 400 && reply.statusCode < 600) {
        let body: any;
        try {
          body = JSON.parse(payload);
        } catch (error) {
          console.error('Error parsing payload:', error);
          // If there's a parsing error, just return the original payload
          return payload;
        }

        // Append or overwrite the 'error' field
        body.error = body.error || 'An error occurred';

        return JSON.stringify(body);
      }

      // If it's not an error response, just return the original payload
      return payload;
    }
  );
};

export default setupOnSendHook;
