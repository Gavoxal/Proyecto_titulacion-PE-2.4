import { FastifyInstance } from 'fastify';

export async function proposalRoutes(app: FastifyInstance) {
    app.get('/', async (request, reply) => {
        return { message: 'Proposals list' };
    });
}
