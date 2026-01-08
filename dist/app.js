"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const fastify_type_provider_zod_1 = require("fastify-type-provider-zod");
const swagger_1 = require("@fastify/swagger");
const swagger_ui_1 = require("@fastify/swagger-ui");
const server = (0, fastify_1.default)({
    logger: true,
}).withTypeProvider();
// Validator & Serializer
server.setValidatorCompiler(fastify_type_provider_zod_1.validatorCompiler);
server.setSerializerCompiler(fastify_type_provider_zod_1.serializerCompiler);
const jwt_1 = __importDefault(require("@fastify/jwt"));
const auth_routes_1 = require("./modules/auth/auth.routes");
const users_routes_1 = require("./modules/users/users.routes");
// Plugins
server.register(cors_1.default, {
    origin: '*', // Adjust in production
});
server.register(jwt_1.default, {
    secret: process.env.JWT_SECRET || 'supersecret',
});
// Routes
server.register(auth_routes_1.authRoutes, { prefix: '/auth' });
server.register(users_routes_1.userRoutes, { prefix: '/users' });
// Swagger
server.register(swagger_1.fastifySwagger, {
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
    transform: fastify_type_provider_zod_1.jsonSchemaTransform,
});
server.register(swagger_ui_1.fastifySwaggerUi, {
    routePrefix: '/documentation',
});
// Health check
server.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
});
const start = async () => {
    try {
        await server.listen({ port: 3000, host: '0.0.0.0' });
        console.log('Server running on http://localhost:3000');
        console.log('Documentation at http://localhost:3000/documentation');
    }
    catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};
start();
