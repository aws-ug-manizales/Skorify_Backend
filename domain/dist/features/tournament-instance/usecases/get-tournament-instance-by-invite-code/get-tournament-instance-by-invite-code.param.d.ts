import { TournamentInstanceState } from '../../tournament-instance.entity';
export interface GetTournamentInstanceByInviteCodeParam {
    inviteCode: string;
    state?: TournamentInstanceState;
}
