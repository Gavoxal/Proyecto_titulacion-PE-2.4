"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = authRoutes;
const zod_1 = require("zod");
const prisma_1 = require("../../lib/prisma");
const auth_utils_1 = require("./auth.utils");
async function authRoutes(app) {
    app.withTypeProvider().post('/login', {
        schema: {
            tags: ['Auth'],
            summary: 'Iniciar sesión',
            description: 'Authenticate user and return JWT token',
            body: zod_1.z.object({
                email: zod_1.z.string().email(),
                password: zod_1.z.string(),
            }),
            response: {
                200: zod_1.z.object({
                    token: zod_1.z.string(),
                    user: zod_1.z.object({
                        id: zod_1.z.number(),
                        nombres: zod_1.z.string(),
                        apellidos: zod_1.z.string(),
                        email: zod_1.z.string(),
                        rol: zod_1.z.string(),
                    }),
                }),
                401: zod_1.z.object({
                    message: zod_1.z.string(),
                }),
            },
        },
    }, async (request, reply) => {
        const { email, password } = request.body;
        const user = await prisma_1.prisma.usuario.findUnique({
            where: { correoInstitucional: email },
        });
        if (!user) {
            return reply.status(401).send({ message: 'Credenciales inválidas' });
        }
        const isValid = await (0, auth_utils_1.verifyPassword)(password, user.clave);
        if (!isValid) {
            return reply.status(401).send({ message: 'Credenciales inválidas' });
        }
        // Generate Token
        const token = app.jwt.sign({
            id: user.id,
            email: user.correoInstitucional,
            role: user.rol,
        });
        return reply.send({
            token,
            user: {
                id: user.id,
                nombres: user.nombres,
                apellidos: user.apellidos,
                email: user.correoInstitucional,
                rol: user.rol,
            },
        });
    });
}
