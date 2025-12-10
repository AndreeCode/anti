import fs from 'fs';
import path from 'path';
import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Configurar __dirname para ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.error('\x1b[31m%s\x1b[0m', '❌ ERROR: No se encontró la variable DATABASE_URL.');
    console.log('Por favor, crea un archivo .env en la raíz del proyecto con tu cadena de conexión de Supabase:');
    console.log('DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres"');
    process.exit(1);
}

const client = new pg.Client({
    connectionString: DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Función para enmascarar la URL y no mostrar la contraseña
function getMaskedUrl(url) {
    try {
        const u = new URL(url);
        u.password = '****';
        return u.toString();
    } catch (e) {
        return 'URL inválida/desconocida';
    }
}

async function resetDatabase() {
    console.log('\n\x1b[36m%s\x1b[0m', '� Iniciando script de reset...');
    console.log(`📡 URL de destino: ${getMaskedUrl(DATABASE_URL)}`);

    try {
        console.log('🔌 Intentando conectar a PostgreSQL...');
        await client.connect();
        console.log('\x1b[32m%s\x1b[0m', '✅ Conexión establecida correctamente.');

        const schemaPath = path.join(__dirname, '..', 'schema.sql');
        console.log(`📂 Buscando archivo de esquema en: ${schemaPath}`);

        if (!fs.existsSync(schemaPath)) {
            throw new Error(`No se encontró el archivo schema.sql en ${schemaPath}`);
        }

        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        console.log(`📝 Archivo leído (${schemaSql.length} bytes). Preparando ejecución...`);

        console.log('\x1b[33m%s\x1b[0m', '⏳ Ejecutando comandos SQL (DROP/CREATE/INSERT)...');
        console.time('Tiempo de ejecución');

        // Ejecutar el SQL
        await client.query(schemaSql);

        console.timeEnd('Tiempo de ejecución');

        console.log('\x1b[32m%s\x1b[0m', '✅ ¡Base de datos reseteada y sembrada con éxito!');
        console.log('   - Tablas recreadas');
        console.log('   - Menú inicial cargado');
        console.log('\x1b[36m%s\x1b[0m', 'ℹ️  Nota: Registra los usuarios (Admin/Cliente) manualmente desde la aplicación.');
        console.log('   (El trigger automático asignará los roles correctamente)');

        // Verificación final
        console.log('\n\x1b[36m%s\x1b[0m', '🔍 Verificando datos insertados (SELECT * FROM users)...');
        const res = await client.query('SELECT name, email, role FROM users');
        console.table(res.rows);

    } catch (err) {
        console.error('\n\x1b[31m%s\x1b[0m', '❌ ERROR CRÍTICO AL RESETEAR LA BD:');
        console.error('----------------------------------------');
        console.error(`Mensaje: ${err.message}`);
        console.error(`Código: ${err.code || 'N/A'}`);
        if (err.hint) console.error(`Pista: ${err.hint}`);
        if (err.position) console.error(`Posición: ${err.position}`);
        console.error('----------------------------------------');
        console.error('Full Stack:', err);
        process.exit(1);
    } finally {
        console.log('🔌 Cerrando conexión...');
        await client.end();
    }
}

resetDatabase();
