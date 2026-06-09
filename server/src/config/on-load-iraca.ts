import { IracaContainer } from '@scifamek-open-source/iraca/dependency-injection';
import { DBClient } from '@skorify/data';
import { EventBusContract, StorageContract } from '@skorify/domain/core';
import { CalculateMatchScoreUsecase, MatchEntity, ReactiveClosedMatchDomainEvent } from '@skorify/domain/match';
import { EventBusMemoryImpl, Queue, StorageMemoryImpl, JsonDataSource } from '@skorify/shared';
import { join } from 'path';
import { logger, serializeError } from './logger';
import { UserEnrollmentEntity } from 'node_modules/@skorify/domain/dist/features/user-enrollment/user-enrollment.entity';
import { UserEntity } from '@skorify/domain/user';
import { PredictionEntity } from '@skorify/domain/prediction';
import { TournamentEntity } from '@skorify/domain/tournament';
import { TournamentInstanceEntity } from 'node_modules/@skorify/domain/dist/features/tournament-instance/tournament-instance.entity';
import { TeamEntity } from '@skorify/domain/team';

// type DatabaseConfig = {
//   host: string;
//   port: string;
//   username: string;
//   password: string;
//   enabled: string;
//   engine:
//     | 'mysql'
//     | 'mariadb'
//     | 'postgres'
//     | 'cockroachdb'
//     | 'sqlite'
//     | 'mssql'
//     | 'sap'
//     | 'oracle'
//     | 'cordova'
//     | 'nativescript'
//     | 'react-native'
//     | 'sqljs'
//     | 'mongodb'
//     | 'aurora-mysql';
//   name: string;
//   logging?: boolean;
// };
type Injections = {
  // database: DatabaseConfig;
  [key: string]: unknown;
};
export const onLoadIraca = async (container: IracaContainer, injections: Injections) => {
  const { database } = injections;
  // const { host, port, username, engine, password, name, logging, enabled } = database;
  // logger.debug('Loading Iraca container', {
  //   database: {
  //     enabled,
  //     engine,
  //     host,
  //     port,
  //     name,
  //     logging,
  //   },
  // });

  const dataPath = join(__dirname, '../../../shared/src/data');

  // if (enabled != 'true') {
  //   const dbClient = new DBClient({
  //     type: 'postgres',
  //     host,
  //     port: parseInt(port),
  //     username,
  //     password,
  //     database: name,
  //   });

  // Connect to database
  // try {
  //   await dbClient.connect();
  //   logger.debug('Database connected successfully');
  // } catch (error) {
  //   logger.error('Failed to connect to database', { error: serializeError(error) });
  //   process.exit(1);
  // }

  // container.addValue({
  //   id: 'DBClient',
  //   value: dbClient,
  // });

  // container.addValue({
  //   id: 'UserContract',
  //   value: dbClient.users,
  // });

  // container.addValue({
  //   id: 'UserEnrollmentContract',
  //   value: dbClient.userEnrollments,
  // });

  // container.addValue({
  //   id: 'TournamentContract',
  //   value: dbClient.tournaments,
  // });

  // container.addValue({
  //   id: 'TeamContract',
  //   value: dbClient.teams,
  // });

  // container.addValue({
  //   id: 'MatchContract',
  //   value: dbClient.matches,
  // });
  // container.addValue({
  //   id: 'PredictionContract',
  //   value: dbClient.predictions,
  // });
  // container.addValue({
  //   id: 'TournamentInstanceContract',
  //   value: dbClient.tournamentInstances,
  // });
  // }
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

  const queue = new Queue();

  queue.subscribe(ReactiveClosedMatchDomainEvent.eventName, async (data: any) => {
    logger.debug('Reactive match close event received', {
      matchId: data.match?.id,
      tournamentInstanceId: data.tournamentInstance?.id,
    });

    try {
      const usecase = await container.getInstance<CalculateMatchScoreUsecase>(
        CalculateMatchScoreUsecase,
      );
      if (usecase) {
        await usecase.call({
          matchId: data.match.id,
          tournamentInstanceId: data.tournamentInstance.id,
        });
      }
    } catch (error) {
      logger.error('Reactive match score calculation failed', {
        matchId: data.match?.id,
        tournamentInstanceId: data.tournamentInstance?.id,
        error: serializeError(error),
      });
      throw error;
    }
  });

  container.addValue({
    id: 'Queue',
    value: queue,
  });

  container.add({
    abstraction: EventBusContract,
    implementation: EventBusMemoryImpl,
    dependencies: ['Queue'],
  });

  container.addValue({
    id: 'rootFolder',
    value: join(__dirname, '../../../shared/src/storage'),
  });
  container.add({
    abstraction: StorageContract,
    implementation: StorageMemoryImpl,
    dependencies: ['rootFolder'],
  });
};
