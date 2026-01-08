import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { serializerCompiler, validatorCompiler, ZodTypeProvider, jsonSchemaTransform } from 'fastify-type-provider-zod';
import { fastifySwagger } from '@fastify/swagger';
import { fastifySwaggerUi } from '@fastify/swagger-ui';

import fastifyJwt from '@fastify/jwt';
import { authRoutes } from './modules/auth/auth.routes';
import { userRoutes } from './modules/users/users.routes';

const server = Fastify({
    logger: true,
}).withTypeProvider<ZodTypeProvider>();

// Validator & Serializer
server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);

// Plugins
server.register(cors, {
    origin: '*', // Adjust in production
});

server.register(fastifyJwt, {
    secret: process.env.JWT_SECRET || 'supersecret',
});

// Swagger
server.register(fastifySwagger, {
    openapi: {
        info: {
            title: 'Sistema de Gestión de Titulación API',
            description: 'API REST para la gestión de procesos de titulación',
            version: '1.0.0',
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    },
    transform: jsonSchemaTransform,
});

server.register(fastifySwaggerUi, {
    routePrefix: '/documentation',
});

// Routes
server.register(authRoutes, { prefix: '/auth' });
server.register(userRoutes, { prefix: '/users' });

// Health check
server.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
});

const start = async () => {
    try {
        await server.listen({ port: 3000, host: '0.0.0.0' });
        console.log('Server running on http://localhost:3000');
        console.log('Documentation at http://localhost:3000/documentation');
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

start();
