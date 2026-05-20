export type Score = {
    awayScore: number;
    homeScore: number;
};
export type MatchOutcome = -1 | 0 | 1;
export declare function goalDiff(score: Score): number;
export declare function outcome(score: Score): MatchOutcome;
export declare function isSameOutcome(a: Score, b: Score): boolean;
export declare function isExactScore(a: Score, b: Score): boolean;
export declare function isInverseOutcome(a: Score, b: Score): boolean;
export declare function totalGoals(score: Score): number;
