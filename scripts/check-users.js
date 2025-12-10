import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.error('❌ ERROR: No se encontró DATABASE_URL en .env');
    process.exit(1);
}

const client = new pg.Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function checkUsers() {
    try {
        console.log('🔌 Conectando a Supabase...');
        await client.connect();

        console.log('🔍 Consultando tabla public.users...');
        const res = await client.query('SELECT id, name, email, role, created_at FROM users');

        if (res.rows.length === 0) {
            console.log('\x1b[33m%s\x1b[0m', '⚠️  La tabla public.users está VACÍA.');
            console.log('   Esto significa que:');
            console.log('   1. El registro falló.');
            console.log('   2. O el usuario Auth se creó pero el Trigger falló.');
        } else {
            console.log('\x1b[32m%s\x1b[0m', `✅ Se encontraron ${res.rows.length} usuarios:`);
            console.table(res.rows);
        }

    } catch (err) {
        console.error('❌ Error consultando la base de datos:', err);
    } finally {
        await client.end();
    }
}

checkUsers();
