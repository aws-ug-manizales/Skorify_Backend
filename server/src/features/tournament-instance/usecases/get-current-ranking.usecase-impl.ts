import { DomainEvent } from '@skorify/domain/core';
import {
  GetCurrentRankingParam,
  GetCurrentRankingUsecase,
  GetTournamentInstanceByIdUsecase,
  GottenTournamentInstanceCurrentRankingDomainEvent,
  GottenTournamentInstanceDomainEvent,
  RankingItem,
} from '@skorify/domain/tournament-instance';
import { GetUsersByIdsUsecase, GottenUserDomainEvent, UserEntity } from '@skorify/domain/user';
import {
  GetUserEnrollmentsByTournamentInstanceIdUsecase,
  GottenUserEnrollmentsDomainEvent,
  UserEnrollmentEntity,
} from '@skorify/domain/user-enrollment';

export class GetCurrentRankingUsecaseImpl extends GetCurrentRankingUsecase {
  constructor(
    private getTournamentInstanceByIdUsecase: GetTournamentInstanceByIdUsecase,
    private getUserEnrollmentsByTournamentInstanceIdUsecase: GetUserEnrollmentsByTournamentInstanceIdUsecase,
    private getUsersByIdsUsecase: GetUsersByIdsUsecase,
  ) {
    super();
  }

  async call(param: GetCurrentRankingParam): Promise<DomainEvent> {
    const { tournamentInstanceId } = param;

    const tournamentInstanceDE = await this.getTournamentInstanceByIdUsecase.call({
      tournamentInstanceId,
    });
    if (tournamentInstanceDE.isNot(GottenTournamentInstanceDomainEvent)) {
      return tournamentInstanceDE;
    }

    const userEnrollmentsDE = await this.getUserEnrollmentsByTournamentInstanceIdUsecase.call({
      tournamentInstanceId,
    });
    if (userEnrollmentsDE.isNot(GottenUserEnrollmentsDomainEvent)) {
      return userEnrollmentsDE;
    }
    const userEnrollments: UserEnrollmentEntity[] = userEnrollmentsDE.payload;

    const rankedUserEnrollmentsSorted = userEnrollments
      .filter((ue) => ue.currentPosition != null)
      .sort((left, right) => {
        if (left.currentPosition !== right.currentPosition) {
          return (left.currentPosition ?? 0) - (right.currentPosition ?? 0);
        }

        return (right.currentScore ?? 0) - (left.currentScore ?? 0);
      });

    const pendingUserEnrollments = userEnrollments.filter((ue) => ue.currentPosition == null);

    const orderedUserEnrollments = [...rankedUserEnrollmentsSorted, ...pendingUserEnrollments];
    console.log('orderedUserEnrollments', orderedUserEnrollments);
    const userIds = orderedUserEnrollments.map((ue) => ue.userId);
    console.log('userIds', userIds);
    const ranking: RankingItem[] = [];

    const allUsersDE = await this.getUsersByIdsUsecase.call({
      userIds,
    });
    const allUsers: UserEntity[] = allUsersDE.payload;

    const filteredUsers: {
      userEnrollment: UserEnrollmentEntity;
      user: UserEntity;
    }[] = orderedUserEnrollments
      .map((userEnrollment) => {
        const user = allUsers.find((u) => u.id === userEnrollment.userId);
        return {
          userEnrollment,
          user,
        };
      })
      .filter((element) => element.user !== undefined) as {
      userEnrollment: UserEnrollmentEntity;
      user: UserEntity;
    }[];

    for (const element of filteredUsers) {
      const { userEnrollment, user } = element;
      ranking.push({
        userId: user.id,
        userName: user.name,
        currentPosition: userEnrollment.currentPosition ?? -1,
        lastPosition: userEnrollment.lastPosition ?? -1,
        score: userEnrollment.currentScore ?? 0,
        points: userEnrollment.currentScore ?? 0,
        maxStreak: userEnrollment.maxStreak ?? 0,
        streak: userEnrollment.streak ?? 0,
      });
    }

    return GottenTournamentInstanceCurrentRankingDomainEvent(ranking);
  }
}
