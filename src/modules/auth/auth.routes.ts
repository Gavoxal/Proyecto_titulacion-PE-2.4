import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { prisma } from '../../lib/prisma';
import { verifyPassword } from './auth.utils';

export async function authRoutes(app: FastifyInstance) {
    app.withTypeProvider<ZodTypeProvider>().post(
        '/login',
        {
            schema: {
                tags: ['Auth'],
                summary: 'Iniciar sesión',
                description: 'Authenticate user and return JWT token',
                body: z.object({
                    email: z.string().email(),
                    password: z.string(),
                }),
                response: {
                    200: z.object({
                        token: z.string(),
                        user: z.object({
                            id: z.number(),
                            nombres: z.string(),
                            apellidos: z.string(),
                            email: z.string(),
                            rol: z.string(),
                        }),
                    }),
                    401: z.object({
                        message: z.string(),
                    }),
                },
            },
        },
        async (request, reply) => {
            const { email, password } = request.body;

            const user = await prisma.usuario.findUnique({
                where: { correoInstitucional: email },
            });

            if (!user) {
                return reply.status(401).send({ message: 'Credenciales inválidas' });
            }

            const isValid = await verifyPassword(password, user.clave);

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
        }
    );
}
