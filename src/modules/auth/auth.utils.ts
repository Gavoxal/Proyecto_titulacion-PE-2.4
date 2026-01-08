import bcrypt from 'bcrypt';
import { FastifyReply, FastifyRequest } from 'fastify';
import '@fastify/jwt'; // Ensure type augmentation is loaded

export async function hashPassword(password: string) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

export async function verifyPassword(candidatePassword: string, hash: string) {
    return bcrypt.compare(candidatePassword, hash);
}

// Middleware for protected routes (optional usage if not using @fastify/jwt verify at route level)
export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
    try {
        await request.jwtVerify();
    } catch (err) {
        reply.send(err);
    }
}
