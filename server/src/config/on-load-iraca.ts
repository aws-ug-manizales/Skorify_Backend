import { IracaContainer } from '@scifamek-open-source/iraca/dependency-injection';
import { DBClient } from '@skorify/data';
import { MatchEntity } from '@skorify/domain/match';
import { PredictionEntity } from '@skorify/domain/prediction';
import { TeamEntity } from '@skorify/domain/team';
import { TournamentEntity } from '@skorify/domain/tournament';
import { TournamentInstanceEntity } from '@skorify/domain/tournament-instance';
import { UserEntity } from '@skorify/domain/user';
import { UserEnrollmentEntity } from '@skorify/domain/user-enrollment';
import { join } from 'path';
import {
  UserPostgresDataSource,
  MatchPostgresDataSource,
  JsonDataSource,
} from '@skorify/shared';
import { EventBusImpl, StorageImpl } from '@skorify/shared/core';
import { EventBusContract, StorageContract } from '@skorify/domain/core';
import { CalculateMatchScoreUsecase } from '@skorify/domain/match';
import { LoggerContext} from "@skorify/shared";
import { LoggerAdapter} from "../core/logger.adapter";

type DatabaseConfig = {
  host: string;
  port: number;
  username: string;
  password: string;
  name: string;
  logging?: boolean;
};
type Injections = {
  database: DatabaseConfig;
  [key: string]: unknown;
};
export const onLoadIraca = async (container: IracaContainer, injections: Injections) => {
  const { database, eventBus, storage } = injections;
  const { host, port, username, password, name, logging } = database;
  const dataPath = join(__dirname, '../../../shared/src/data');

  // Inicializar Logger
  const loggerFolder = "logs";
  const logger = new LoggerAdapter(loggerFolder);
  LoggerContext.initialize(logger);
  container.addValue({
    id: "Logger",
    value: logger,
  });

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
    id: 'MatchDatasource',
    value: new JsonDataSource<MatchEntity>('matches.json', dataPath),
  });
  container.addValue({
    id: 'UserDatasource',
    value: new JsonDataSource<UserEntity>('users.json', dataPath),
  });
  container.addValue({
    id: 'UserEnrollmentDatasource',
    value: new JsonDataSource<UserEnrollmentEntity>('user-enrollments.json', dataPath),
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
    id: 'PredictionDatasource',
    value: new JsonDataSource<PredictionEntity>('predictions.json', dataPath),
  });
  container.addValue({
    id: 'TournamentDatasource',
    value: new JsonDataSource<TournamentEntity>('tournaments.json', dataPath),
  });
  container.addValue({
    id: 'TournamentInstanceDatasource',
    value: new JsonDataSource<TournamentInstanceEntity>('tournament-instances.json', dataPath),
  });
  container.addValue({
    id: 'TeamDatasource',
    value: new JsonDataSource<TeamEntity>('teams.json', dataPath),
  });

  container.add({
    abstraction: EventBusContract,
    implementation: EventBusImpl,
    dependencies: ['eventBus'],
  });

  container.add({
    abstraction: StorageContract,
    implementation: StorageImpl,
    dependencies: ['storage'],
  });
};
