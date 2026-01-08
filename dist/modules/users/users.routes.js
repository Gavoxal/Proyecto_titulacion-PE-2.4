"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = userRoutes;
const zod_1 = require("zod");
const prisma_1 = require("../../lib/prisma");
const auth_utils_1 = require("../auth/auth.utils");
async function userRoutes(app) {
    // Global protection for all user routes (or apply per route)
    app.addHook('preHandler', auth_utils_1.authenticate);
    // GET / - List all users
    app.withTypeProvider().get('/', {
        schema: {
            tags: ['Users'],
            summary: 'Listar usuarios',
            description: 'Obtiene una lista de todos los usuarios registrados',
            response: {
                200: zod_1.z.array(zod_1.z.object({
                    id: zod_1.z.number(),
                    nombres: zod_1.z.string(),
                    apellidos: zod_1.z.string(),
                    correoInstitucional: zod_1.z.string(),
                    rol: zod_1.z.string(),
                })),
            },
        },
    }, async (request, reply) => {
        const users = await prisma_1.prisma.usuario.findMany({
            select: {
                id: true,
                nombres: true,
                apellidos: true,
                correoInstitucional: true,
                rol: true,
            },
        });
        return users;
    });
    // POST / - Create user
    app.withTypeProvider().post('/', {
        schema: {
            tags: ['Users'],
            summary: 'Crear usuario',
            body: zod_1.z.object({
                nombres: zod_1.z.string(),
                apellidos: zod_1.z.string(),
                correoInstitucional: zod_1.z.string().email(),
                clave: zod_1.z.string().min(6),
                rol: zod_1.z.enum(['ESTUDIANTE', 'TUTOR', 'DIRECTOR', 'COORDINADOR', 'COMITE', 'DOCENTE_INTEGRACION']),
            }),
            response: {
                201: zod_1.z.object({
                    id: zod_1.z.number(),
                    email: zod_1.z.string(),
                    rol: zod_1.z.string(),
                }),
                409: zod_1.z.object({
                    message: zod_1.z.string(),
                }),
            },
        },
    }, async (request, reply) => {
        const { nombres, apellidos, correoInstitucional, clave, rol } = request.body;
        // Check if user exists
        const existing = await prisma_1.prisma.usuario.findUnique({
            where: { correoInstitucional },
        });
        if (existing) {
            return reply.status(409).send({ message: 'El usuario ya existe' }); // 409 Conflict
        }
        const hashedPassword = await (0, auth_utils_1.hashPassword)(clave);
        const newUser = await prisma_1.prisma.usuario.create({
            data: {
                nombres,
                apellidos,
                correoInstitucional,
                clave: hashedPassword,
                rol: rol, // Cast to match Prisma Enum
            },
        });
        return reply.status(201).send({
            id: newUser.id,
            email: newUser.correoInstitucional,
            rol: newUser.rol,
        });
    });
    // GET /:id - Get one user
    app.withTypeProvider().get('/:id', {
        schema: {
            tags: ['Users'],
            summary: 'Obtener usuario por ID',
            params: zod_1.z.object({
                id: zod_1.z.coerce.number(),
            }),
            response: {
                200: zod_1.z.object({
                    id: zod_1.z.number(),
                    nombres: zod_1.z.string(),
                    apellidos: zod_1.z.string(),
                    email: zod_1.z.string(),
                    rol: zod_1.z.string(),
                }),
                404: zod_1.z.object({ message: zod_1.z.string() }),
            },
        },
    }, async (request, reply) => {
        const { id } = request.params;
        const user = await prisma_1.prisma.usuario.findUnique({
            where: { id },
        });
        if (!user) {
            return reply.status(404).send({ message: 'Usuario no encontrado' });
        }
        return {
            id: user.id,
            nombres: user.nombres,
            apellidos: user.apellidos,
            email: user.correoInstitucional,
            rol: user.rol,
        };
    });
    // DELETE /:id - Delete user
    app.withTypeProvider().delete('/:id', {
        schema: {
            tags: ['Users'],
            summary: 'Eliminar usuario',
            params: zod_1.z.object({
                id: zod_1.z.coerce.number(),
            }),
            response: {
                200: zod_1.z.object({ message: zod_1.z.string() }),
                404: zod_1.z.object({ message: zod_1.z.string() }),
            },
        },
    }, async (request, reply) => {
        const { id } = request.params;
        try {
            await prisma_1.prisma.usuario.delete({
                where: { id },
            });
            return { message: 'Usuario eliminado correctamente' };
        }
        catch (error) {
            return reply.status(404).send({ message: 'Usuario no encontrado o no se puede eliminar' });
        }
    });
}
