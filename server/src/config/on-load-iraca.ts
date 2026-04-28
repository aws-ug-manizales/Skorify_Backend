import { IracaContainer } from "@scifamek-open-source/iraca/dependency-injection";
import { DBClient } from "@skorify/data";
import { PostgresMatchDataSource } from "@skorify/shared";

export const onLoadIraca = async (
  container: IracaContainer,
  injections?: any,
) => {
  const { database } = injections;
  const { host, port, username, password, name, logging } = database;
  const dbClient = new DBClient({
    type: "postgres",
    host,
    port: parseInt(port),
    username,
    password,
    database: name,
    synchronize: false,
    logging,
  });

  // Connect to database
  try {
    await dbClient.connect();
    console.log("Database connected successfully");
  } catch (error) {
    console.error("Failed to connect to database:", error);
    process.exit(1);
  }

  container.addValue({
    id: "DBClient",
    value: dbClient,
  });
  container.addValue({
    id: "MatchDatasource",
    value: new PostgresMatchDataSource(dbClient),
  });
};
