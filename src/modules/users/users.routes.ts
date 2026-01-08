import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { prisma } from '../../lib/prisma';
import { hashPassword, authenticate } from '../auth/auth.utils';

export async function userRoutes(app: FastifyInstance) {
    // Global protection for all user routes (or apply per route)
    app.addHook('preHandler', authenticate);

    // GET / - List all users
    app.withTypeProvider<ZodTypeProvider>().get(
        '/',
        {
            schema: {
                tags: ['Users'],
                summary: 'Listar usuarios',
                description: 'Obtiene una lista de todos los usuarios registrados',
                response: {
                    200: z.array(
                        z.object({
                            id: z.number(),
                            nombres: z.string(),
                            apellidos: z.string(),
                            correoInstitucional: z.string(),
                            rol: z.string(),
                        })
                    ),
                },
            },
        },
        async (request, reply) => {
            const users = await prisma.usuario.findMany({
                select: {
                    id: true,
                    nombres: true,
                    apellidos: true,
                    correoInstitucional: true,
                    rol: true,
                },
            });
            return users;
        }
    );

    // POST / - Create user
    app.withTypeProvider<ZodTypeProvider>().post(
        '/',
        {
            schema: {
                tags: ['Users'],
                summary: 'Crear usuario',
                body: z.object({
                    nombres: z.string(),
                    apellidos: z.string(),
                    correoInstitucional: z.string().email(),
                    clave: z.string().min(6),
                    rol: z.enum(['ESTUDIANTE', 'TUTOR', 'DIRECTOR', 'COORDINADOR', 'COMITE', 'DOCENTE_INTEGRACION']),
                }),
                response: {
                    201: z.object({
                        id: z.number(),
                        email: z.string(),
                        rol: z.string(),
                    }),
                    409: z.object({
                        message: z.string(),
                    }),
                },
            },
        },
        async (request, reply) => {
            const { nombres, apellidos, correoInstitucional, clave, rol } = request.body;

            // Check if user exists
            const existing = await prisma.usuario.findUnique({
                where: { correoInstitucional },
            });

            if (existing) {
                return reply.status(409).send({ message: 'El usuario ya existe' }); // 409 Conflict
            }

            const hashedPassword = await hashPassword(clave);

            const newUser = await prisma.usuario.create({
                data: {
                    nombres,
                    apellidos,
                    correoInstitucional,
                    clave: hashedPassword,
                    rol: rol as any, // Cast to match Prisma Enum
                },
            });

            return reply.status(201).send({
                id: newUser.id,
                email: newUser.correoInstitucional,
                rol: newUser.rol,
            });
        }
    );

    // GET /:id - Get one user
    app.withTypeProvider<ZodTypeProvider>().get(
        '/:id',
        {
            schema: {
                tags: ['Users'],
                summary: 'Obtener usuario por ID',
                params: z.object({
                    id: z.coerce.number(),
                }),
                response: {
                    200: z.object({
                        id: z.number(),
                        nombres: z.string(),
                        apellidos: z.string(),
                        email: z.string(),
                        rol: z.string(),
                    }),
                    404: z.object({ message: z.string() }),
                },
            },
        },
        async (request, reply) => {
            const { id } = request.params;
            const user = await prisma.usuario.findUnique({
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
        }
    );

    // DELETE /:id - Delete user
    app.withTypeProvider<ZodTypeProvider>().delete(
        '/:id',
        {
            schema: {
                tags: ['Users'],
                summary: 'Eliminar usuario',
                params: z.object({
                    id: z.coerce.number(),
                }),
                response: {
                    200: z.object({ message: z.string() }),
                    404: z.object({ message: z.string() }),
                },
            },
        },
        async (request, reply) => {
            const { id } = request.params;

            try {
                await prisma.usuario.delete({
                    where: { id },
                });
                return { message: 'Usuario eliminado correctamente' };
            } catch (error) {
                return reply.status(404).send({ message: 'Usuario no encontrado o no se puede eliminar' });
            }
        }
    );
}
