import { IracaContainer } from "@scifamek-open-source/iraca/dependency-injection";
import { DBClient } from "@skorify/data";
import { PredictionEntity } from "@skorify/domain/prediction";
import { TournamentEntity } from "@skorify/domain/tournament";
import { TournamentInstanceEntity } from "@skorify/domain/tournament-instance";
import {
  UserPostgresDataSource,
  MatchPostgresDataSource,
  JsonDataSource,
} from "@skorify/shared";

export const onLoadIraca = async (
  container: IracaContainer,
  injections?: any,
) => {
  const { database } = injections;
  const { host, port, username, password, name, logging } = database;
  console.log(database);

  // const dbClient = new DBClient({
  //   type: "postgres",
  //   host,
  //   port: parseInt(port),
  //   username,
  //   password,
  //   database: name,
  //   synchronize: false,
  //   logging,
  // });

  // Connect to database
  // try {
  //   await dbClient.connect();
  //   console.log("Database connected successfully");
  // } catch (error) {
  //   console.error("Failed to connect to database:", error);
  //   process.exit(1);
  // }

  // container.addValue({
  //   id: "DBClient",
  //   value: dbClient,
  // });
  container.addValue({
    id: "MatchDatasource",
    value: new JsonDataSource<PredictionEntity>("matches.json"),
  });
  container.addValue({
    id: "UserDatasource",
    value: new JsonDataSource<PredictionEntity>("users.json"),
  });
  // container.addValue({
  //   id: "MatchDatasource",
  //   value: new MatchPostgresDataSource(dbClient),
  // });
  // container.addValue({
  //   id: "UserDatasource",
  //   value: new UserPostgresDataSource(dbClient),
  // });
  container.addValue({
    id: "PredictionDatasource",
    value: new JsonDataSource<PredictionEntity>("predictions.json"),
  });
  container.addValue({
    id: "TournamentDatasource",
    value: new JsonDataSource<TournamentEntity>("tournaments.json"),
  });
  container.addValue({
    id: "TournamentInstanceDatasource",
    value: new JsonDataSource<TournamentInstanceEntity>(
      "tournament-intances.json",
    ),
  });
};
