import { FastifyInstance } from 'fastify';

export async function advanceRoutes(app: FastifyInstance) {
    app.get('/', async (request, reply) => {
        return { message: 'Advances list' };
    });
}
