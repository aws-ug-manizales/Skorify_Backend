import { DBClient } from "skorifydata";

export const db = new DBClient({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || "polla_mundial",
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "password",
});