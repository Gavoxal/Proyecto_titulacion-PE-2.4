import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/modules/auth/auth.utils'; // Adjust path if needed

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seeding...');

    // 1. Clean existing data (optional, be careful in prod)
    // await prisma.usuario.deleteMany(); 

    // 2. Create Admin/Test User
    const email = 'estudiante@uide.edu.ec';
    const passwordRaw = '123456';
    const passwordHash = await hashPassword(passwordRaw);

    const estudiante = await prisma.usuario.upsert({
        where: { correoInstitucional: email },
        update: {},
        create: {
            nombres: 'Estudiante',
            apellidos: 'Prueba',
            correoInstitucional: email,
            clave: passwordHash,
            rol: 'ESTUDIANTE',
        },
    });

    console.log(`✅ Created user: ${estudiante.correoInstitucional} (Password: ${passwordRaw})`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
