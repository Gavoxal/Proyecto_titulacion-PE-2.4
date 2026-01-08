"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.proposalRoutes = proposalRoutes;
async function proposalRoutes(app) {
    app.get('/', async (request, reply) => {
        return { message: 'Proposals list' };
    });
}
