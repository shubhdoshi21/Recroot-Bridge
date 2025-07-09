import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import tedious from "tedious";

dotenv.config();

export const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    port: process.env.DB_PORT || 1433,
    dialect: "mssql",
    dialectModule: tedious,
    logging: false,
    dialectOptions: {
      options: {
        server: process.env.DB_HOST,
        encrypt: false,
        trustServerCertificate: true,
        debug: {
          packet: true,
          data: true,
          payload: true,
          token: false,
          log: false,
        },
        enableArithAbort: true,
        requestTimeout: 30000,
        connectTimeout: 30000,
      },
    },
    pool: {
      max: Number.parseInt(process.env.DB_POOL_MAX || "5"),
      min: Number.parseInt(process.env.DB_POOL_MIN || "0"),
      acquire: Number.parseInt(process.env.DB_POOL_ACQUIRE || "30000"),
      idle: Number.parseInt(process.env.DB_POOL_IDLE || "10000"),
    },
  }
);
