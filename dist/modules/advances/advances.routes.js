"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.advanceRoutes = advanceRoutes;
async function advanceRoutes(app) {
    app.get('/', async (request, reply) => {
        return { message: 'Advances list' };
    });
}
