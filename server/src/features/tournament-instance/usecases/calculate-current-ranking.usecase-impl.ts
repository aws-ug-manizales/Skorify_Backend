import { DomainEvent } from '@skorify/domain/core';
import {
  GetCurrentRankingParam,
  CalculateCurrentRankingUsecase,
  GetTournamentInstanceByIdUsecase,
  GottenTournamentInstanceDomainEvent,
  RankingItem,
} from '@skorify/domain/tournament-instance';
import {
  GetUserEnrollmentsByTournamentInstanceIdUsecase,
  GottenUserEnrollmentsDomainEvent,
  UpdateCurrentPositionUsecase,
  CalculatedRankingDomainEvent,
  UserEnrollmentEntity,
} from '@skorify/domain/user-enrollment';

interface Record {
  ranking: RankingItem[];
  date: Date;
}
export class CalculateCurrentRankingUsecaseImpl extends CalculateCurrentRankingUsecase {
  constructor(
    private getTournamentInstanceByIdUsecase: GetTournamentInstanceByIdUsecase,
    private getUserEnrollmentsByTournamentInstanceIdUsecase: GetUserEnrollmentsByTournamentInstanceIdUsecase,
    private updateCurrentPositionUsecase: UpdateCurrentPositionUsecase,
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
      if (left.currentScore !== right.currentScore) {
        return (left.currentScore ?? 0) - (right.currentScore ?? 0);
      } else {
        if (left.lastPosition !== right.lastPosition) {
          return (left.lastPosition ?? 0) - (right.lastPosition ?? 0);
        }
      }
      return 0;
    });

    const orderedUserEnrollments = [...rankedUserEnrollmentsSorted, ...pendingUserEnrollments];

    const promises = orderedUserEnrollments.map((userEnrollment, index) => {
      return this.updateCurrentPositionUsecase.call({
        userEnrollmentId: userEnrollment.id,
        currentPostion: index,
      });
    }, []);

    await Promise.all(promises);

    return CalculatedRankingDomainEvent();
  }
}
