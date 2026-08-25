import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_HOST = process.env.DB_HOST || '';
const DB_PORT = Number(process.env.DB_PORT) || 3306;
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'dairy_inventory';

let sequelize;
let activeDatabaseType = 'sqlite';

// If remote MySQL credentials are provided
if (process.env.DB_HOST && process.env.DB_HOST !== 'localhost') {
  activeDatabaseType = 'mysql';
  sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    port: DB_PORT,
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 10000,
      idle: 10000
    },
    define: {
      timestamps: true
    }
  });
} else {
  activeDatabaseType = 'sqlite';
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
  }
};

export { sequelize, activeDatabaseType };
export default sequelize;
