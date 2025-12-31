import { Sequelize } from "sequelize-typescript";
import { Transaction } from '../models/Transaction';
import { Collection } from "../models/Collection";

const isProd = process.env.NODE_ENV === "production";

export const sequelize = new Sequelize(
  isProd
    ? process.env.MYSQL_URL!
    : "mysql://root:12345678@localhost:3306/test",
  {
    dialect: "mysql",
    logging: false,
    models: [Transaction, Collection],

    pool: {
      max: 2,
      min: 0,
      acquire: 60000, // ⏳ cold start safe
      idle: 10000,
    },

    dialectOptions: {
      connectTimeout: 60000, // ⏳ wait for DB
    },
  }
);

// 🔒 shared DB-ready promise
let dbReady: Promise<void> | null = null;

// Initialize DB once
export function initDB() {
  if (!dbReady) {
    dbReady = connectWithRetry();
  }
}

// Retry until DB is available
async function connectWithRetry(
  retries = 10,
  delay = 5000
): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log("✅ DB connected");
  } catch (err) {
    console.warn("⏳ DB not ready, retrying...");

    if (retries <= 0) {
      console.error("❌ DB failed permanently");
      throw err;
    }

    await new Promise(res => setTimeout(res, delay));
    return connectWithRetry(retries - 1, delay);
  }
}

// Await this before handling requests
export async function waitForDB() {
  if (!dbReady) initDB();
  return dbReady!;
}
