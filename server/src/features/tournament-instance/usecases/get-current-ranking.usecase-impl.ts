import { DomainEvent } from '@skorify/domain/core';
import {
  GetCurrentRankingParam,
  GetCurrentRankingUsecase,
  GetTournamentInstanceByIdUsecase,
  GottenTournamentInstanceCurrentRankingDomainEvent,
  GottenTournamentInstanceDomainEvent,
  RankingItem,
} from '@skorify/domain/tournament-instance';
import { GetUsersByIdsUsecase, GottenUsersDomainEvent, UserEntity } from '@skorify/domain/user';
import {
  GetUserEnrollmentsByTournamentInstanceIdUsecase,
  GottenUserEnrollmentsDomainEvent,
  UserEnrollmentEntity,
} from '@skorify/domain/user-enrollment';
import { Logger } from '@aws-lambda-powertools/logger';

export class GetCurrentRankingUsecaseImpl extends GetCurrentRankingUsecase {
  constructor(
    private getTournamentInstanceByIdUsecase: GetTournamentInstanceByIdUsecase,
    private getUserEnrollmentsByTournamentInstanceIdUsecase: GetUserEnrollmentsByTournamentInstanceIdUsecase,
    private getUsersByIdsUsecase: GetUsersByIdsUsecase,
    private logger: Logger,
  ) {
    super();
  }

  async call(param: GetCurrentRankingParam): Promise<DomainEvent> {
    const { tournamentInstanceId } = param;

    const [tournamentInstanceDE, userEnrollmentsDE] = await Promise.all([
      this.getTournamentInstanceByIdUsecase.call({ tournamentInstanceId }),
      this.getUserEnrollmentsByTournamentInstanceIdUsecase.call({ tournamentInstanceId }),
    ]);

    if (tournamentInstanceDE.isNot(GottenTournamentInstanceDomainEvent)) {
      return tournamentInstanceDE;
    }
    if (userEnrollmentsDE.isNot(GottenUserEnrollmentsDomainEvent)) {
      return userEnrollmentsDE;
    }
    const userEnrollments: UserEnrollmentEntity[] = userEnrollmentsDE.payload;

    this.logger.info('Got user enrollments for tournament instance', {
      tournamentInstanceId,
      userEnrollmentsCount: userEnrollments.length,
    });

    const rankedUserEnrollmentsSorted: UserEnrollmentEntity[] = [];
    const pendingUserEnrollments: UserEnrollmentEntity[] = [];
    for (const ue of userEnrollments) {
      if (ue.currentPosition != null) {
        rankedUserEnrollmentsSorted.push(ue);
      } else {
        pendingUserEnrollments.push(ue);
      }
    }
    rankedUserEnrollmentsSorted.sort((left, right) => {
      if (left.currentPosition !== right.currentPosition) {
        return (left.currentPosition ?? 0) - (right.currentPosition ?? 0);
      }
      return (right.currentScore ?? 0) - (left.currentScore ?? 0);
    });

    const orderedUserEnrollments = [...rankedUserEnrollmentsSorted, ...pendingUserEnrollments];
    const userIds = orderedUserEnrollments.map((ue) => ue.userId);

    const allUsersDE = await this.getUsersByIdsUsecase.call({
      userIds,
    });
    if (allUsersDE.isNot(GottenUsersDomainEvent)) {
      this.logger.error('No se pudieron obtener los usuarios del ranking', {
        tournamentInstanceId,
        userIdsCount: userIds.length,
        event: allUsersDE.eventName,
      });
      return allUsersDE;
    }
    const allUsers: UserEntity[] = allUsersDE.payload;

    const usersMap = new Map<string, UserEntity>(allUsers.map((u) => [u.id, u]));

    const ranking: RankingItem[] = orderedUserEnrollments.reduce<RankingItem[]>(
      (acc, userEnrollment) => {
        const user = usersMap.get(userEnrollment.userId);
        if (!user) return acc;
        acc.push({
          userId: user.id,
          userName: user.name,
          currentPosition: userEnrollment.currentPosition ?? -1,
          lastPosition: userEnrollment.lastPosition ?? -1,
          score: userEnrollment.currentScore ?? 0,
          points: userEnrollment.currentScore ?? 0,
          maxStreak: userEnrollment.maxStreak ?? 0,
          streak: userEnrollment.streak ?? 0,
        });
        return acc;
      },
      [],
    );

    return GottenTournamentInstanceCurrentRankingDomainEvent(ranking);
  }
}
