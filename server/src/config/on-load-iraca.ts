import { IracaContainer } from '@scifamek-open-source/iraca/dependency-injection';
import { DBClient } from '@skorify/data';
import { EventBusContract, StorageContract } from '@skorify/domain/core';
import {
  CalculateMatchScoreUsecase,
  MatchEntity,
  ReactiveClosedMatchDomainEvent,
} from '@skorify/domain/match';
import { PredictionEntity } from '@skorify/domain/prediction';
import { TeamEntity } from '@skorify/domain/team';
import { TournamentEntity } from '@skorify/domain/tournament';
import { TournamentInstanceEntity } from '@skorify/domain/tournament-instance';
import { UserEntity } from '@skorify/domain/user';
import { UserEnrollmentContract, UserEnrollmentEntity } from '@skorify/domain/user-enrollment';
import { EventBusMemoryImpl, JsonDataSource, Queue, StorageMemoryImpl } from '@skorify/shared';
import { UserEnrollmentService } from 'node_modules/@skorify/data/dist/lib/services/UserEnrollment.service';
import { join } from 'path';

type DatabaseConfig = {
  host: string;
  port: string;
  username: string;
  password: string;
  enabled: string;
  engine:
    | 'mysql'
    | 'mariadb'
    | 'postgres'
    | 'cockroachdb'
    | 'sqlite'
    | 'mssql'
    | 'sap'
    | 'oracle'
    | 'cordova'
    | 'nativescript'
    | 'react-native'
    | 'sqljs'
    | 'mongodb'
    | 'aurora-mysql';
  name: string;
  logging?: boolean;
};
type Injections = {
  database: DatabaseConfig;
  [key: string]: unknown;
};
export const onLoadIraca = async (container: IracaContainer, injections: Injections) => {
  console.log(injections);
  const { database } = injections;
  const { host, port, username, engine, password, name, logging, enabled } = database;

  const dataPath = join(__dirname, '../../../shared/src/data');

  if (enabled != 'true') {
    const dbClient = new DBClient({
      type: 'postgres',
      host,
      port: parseInt(port),
      username,
      password,
      database: name,
    });

    // Connect to database
    try {
      await dbClient.connect();
      console.log('Database connected successfully');
    } catch (error) {
      console.error('Failed to connect to database:', error);
      process.exit(1);
    }

    container.addValue({
      id: 'DBClient',
      value: dbClient,
    });

    container.addValue({
      id: 'UserContract',
      value: dbClient.users,
    });

    container.addValue({
      id: 'UserEnrollmentContract',
      value: dbClient.userEnrollments,
    });

    container.addValue({
      id: 'TournamentContract',
      value: dbClient.tournaments,
    });

    container.addValue({
      id: 'TeamContract',
      value: dbClient.teams,
    });

    container.addValue({
      id: 'MatchContract',
      value: dbClient.matches,
    });
    container.addValue({
      id: 'PredictionContract',
      value: dbClient.predictions,
    });
    container.addValue({
      id: 'TournamentInstanceContract',
      value: dbClient.tournamentInstances,
    });
  }
  // container.addValue({
  //   id: 'MatchDatasource',
  //   value: new JsonDataSource<MatchEntity>('matches.json', dataPath),
  // });
  // container.addValue({
  //   id: 'UserDatasource',
  //   value: new JsonDataSource<UserEntity>('users.json', dataPath),
  // });
  // container.addValue({
  //   id: 'UserEnrollmentDatasource',
  //   value: new JsonDataSource<UserEnrollmentEntity>('user-enrollments.json', dataPath),
  // });
  // container.addValue({
  //   id: "MatchDatasource",
  //   value: new MatchPostgresDataSource(dbClient),
  // });
  // container.addValue({
  //   id: "UserDatasource",
  //   value: new UserPostgresDataSource(dbClient),
  // });
  // container.addValue({
  //   id: 'PredictionDatasource',
  //   value: new JsonDataSource<PredictionEntity>('predictions.json', dataPath),
  // });
  // container.addValue({
  //   id: 'TournamentDatasource',
  //   value: new JsonDataSource<TournamentEntity>('tournaments.json', dataPath),
  // });
  // container.addValue({
  //   id: 'TournamentInstanceDatasource',
  //   value: new JsonDataSource<TournamentInstanceEntity>('tournament-instances.json', dataPath),
  // });
  // container.addValue({
  //   id: 'TeamDatasource',
  //   value: new JsonDataSource<TeamEntity>('teams.json', dataPath),
  // });

  const queue = new Queue();

  queue.subscribe(ReactiveClosedMatchDomainEvent.eventName, async (data) => {
    console.log('Hola mundo', data);

    const usecase = await container.getInstance<CalculateMatchScoreUsecase>(
      CalculateMatchScoreUsecase,
    );
    if (usecase) {
      await usecase.call({
        matchId: data.match.id,
        tournamentInstanceId: data.tournamentInstance.id,
      });
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
