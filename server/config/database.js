import { Sequelize } from 'sequelize';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = Number(process.env.DB_PORT) || 3306;
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'dairy_inventory';

let sequelize;
let activeDatabaseType = 'mysql';

// Check if MySQL is accessible
const canConnectToMySQL = async () => {
  try {
    const connection = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      connectTimeout: 2000
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await connection.end();
    return true;
  } catch (err) {
    return false;
  }
};

// Initialize Sequelize instance
const hasMySQL = await canConnectToMySQL();

if (hasMySQL) {
  activeDatabaseType = 'mysql';
  sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    port: DB_PORT,
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true
    }
  });
} else {
  activeDatabaseType = 'sqlite';
  console.log('===========================================================================');
  console.log(`ℹ️ [Notice] MySQL is not currently running on ${DB_HOST}:${DB_PORT}.`);
  console.log(`ℹ️ Using local SQLite database (server/database.sqlite) so you can run & test immediately.`);
  console.log(`ℹ️ Start XAMPP / MySQL / Docker MySQL anytime to use native MySQL.`);
  console.log('===========================================================================');
  
  const sqliteStoragePath = process.env.DB_STORAGE || (
    process.env.VERCEL 
      ? '/tmp/database.sqlite' 
      : path.join(__dirname, '../database.sqlite')
  );

  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: sqliteStoragePath,
    logging: false,
    define: {
      timestamps: true
    }
  });
}


export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`[Database] Connected successfully (${activeDatabaseType.toUpperCase()})`);
  } catch (error) {
    console.error('[Database Connection Error]:', error.message);
    throw error;
  }
};

export { sequelize, activeDatabaseType };
export default sequelize;

