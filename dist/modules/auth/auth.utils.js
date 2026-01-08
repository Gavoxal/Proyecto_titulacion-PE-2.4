"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
exports.authenticate = authenticate;
const bcrypt_1 = __importDefault(require("bcrypt"));
require("@fastify/jwt"); // Ensure type augmentation is loaded
async function hashPassword(password) {
    const salt = await bcrypt_1.default.genSalt(10);
    return bcrypt_1.default.hash(password, salt);
}
async function verifyPassword(candidatePassword, hash) {
    return bcrypt_1.default.compare(candidatePassword, hash);
}
// Middleware for protected routes (optional usage if not using @fastify/jwt verify at route level)
async function authenticate(request, reply) {
    try {
        await request.jwtVerify();
    }
    catch (err) {
        reply.send(err);
    }
}
