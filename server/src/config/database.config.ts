import { DBClient } from "skorifydata";

const dbClient = new DBClient({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "polla_mundial",
  synchronize: false,
  logging: process.env.NODE_ENV === "development",
});

export { dbClient };
