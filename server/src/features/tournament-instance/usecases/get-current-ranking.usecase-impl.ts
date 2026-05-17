import { DomainEvent } from '@skorify/domain/core';
import {
  GetCurrentRankingParam,
  GetCurrentRankingUsecase,
  GottenTournamentInstanceCurrentRankingDomainEvent,
  NotGottenTournamentInstanceCurrentRankingDomainEvent,
  RankingItem,
  TournamentInstanceContract,
} from '@skorify/domain/tournament-instance';
import { UserContract } from '@skorify/domain/user';
import { UserEnrollmentContract } from '@skorify/domain/user-enrollment';

export class GetCurrentRankingUsecaseImpl extends GetCurrentRankingUsecase {
  constructor(
    private tournamentInstanceContract: TournamentInstanceContract,
    private userEnrollmentContract: UserEnrollmentContract,
    private userContract: UserContract,
  ) {
    super();
  }

  async call(param: GetCurrentRankingParam): Promise<DomainEvent> {
    const { tournamentInstanceId } = param;

    const tournamentInstance = await this.tournamentInstanceContract.getById(
      tournamentInstanceId,
    );

    if (!tournamentInstance) {
      return NotGottenTournamentInstanceCurrentRankingDomainEvent();
    }

    const userEnrollments = await this.userEnrollmentContract.filter({
      where: { tournamentInstanceId },
    });

    const rankedUserEnrollmentsSorted = userEnrollments
      .filter((ue) => ue.currentPosition != null)
      .sort((left, right) => {
        if (left.currentPosition !== right.currentPosition) {
          return (left.currentPosition ?? 0) - (right.currentPosition ?? 0);
        }

        return (right.currentScore ?? 0) - (left.currentScore ?? 0);
      });

    const pendingUserEnrollments = userEnrollments.filter((ue) => ue.currentPosition == null);

    const orderedUserEnrollments = [
      ...rankedUserEnrollmentsSorted,
      ...pendingUserEnrollments,
    ];

    const ranking: RankingItem[] = [];

    for (const userEnrollment of orderedUserEnrollments) {
      const user = await this.userContract.getById(userEnrollment.userId);

      if (!user) {
        continue;
      }

      ranking.push({
        userId: user.id,
        userName: user.name,
        position: userEnrollment.currentPosition,
        points: userEnrollment.currentScore,
        streak: userEnrollment.streak,
      });
    }

    return GottenTournamentInstanceCurrentRankingDomainEvent(ranking);
  }
}

