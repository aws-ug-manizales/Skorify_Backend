import { PredictionEntity } from "../../src/features/prediction/prediction.entity";
import { PredictionRuleBreakdown } from "../../src/features/prediction/scoreRules/prediction-score.ruleset";

function makePrediction(params: {
  predictionId: string;
  userId: string;
  instanceId: string;
  matchId: string;
  awayScore: number;
  homeScore: number;
}): PredictionEntity {
  const predictionDE = PredictionEntity.build({
    id: params.predictionId as any,
    userId: params.userId as any,
    userEnrollmentId: params.instanceId as any,
    matchId: params.matchId as any,
    tournamentInstanceId: "ti-1111-1111" as any,
    awayScore: params.awayScore,
    homeScore: params.homeScore,
    earnedPoints: 0,
    hasExactResult: false,
  });

  return (predictionDE as any).payload as PredictionEntity;
}

function asMap(breakdown: PredictionRuleBreakdown[]): Record<string, number> {
  return breakdown.reduce<Record<string, number>>((acc, item) => {
    acc[item.rule] = item.points;
    return acc;
  }, {});
}

describe("PredictionEntity.calculateScore", () => {
  const ids = {
    predictionId: "11111111-1111-1111-1111-111111111111",
    userId: "22222222-2222-2222-2222-222222222222",
    instanceId: "44444444-4444-4444-4444-444444444444",
    matchId: "33333333-3333-3333-3333-333333333333",
  };

  const cases: Array<{
    description: string;
    appliedRules: string[];
    prediction: { awayScore: number; homeScore: number };
    match: { awayScore: number; homeScore: number };
    expectedScore: number;
    expectedBreakdown: Record<string, number>;
  }> = [
    {
      description: "exact score + outcome correct",
      appliedRules: ["WinnerDraw (+2)", "TeamGoals (+1 if any team goals match)", "ExactScore (+1)"],
      prediction: { awayScore: 2, homeScore: 1 },
      match: { awayScore: 2, homeScore: 1 },
      expectedScore: 4,
      expectedBreakdown: {
        WinnerDrawRule: 2,
        TeamGoalsRule: 1,
        ExactScoreRule: 1,
      },
    },
    {
      description: "correct outcome only (away wins) does NOT get high scoring bonus unless exact score",
      appliedRules: ["WinnerDraw (+2)"],
      prediction: { awayScore: 1, homeScore: 0 },
      match: { awayScore: 3, homeScore: 1 },
      expectedScore: 2,
      expectedBreakdown: {
        WinnerDrawRule: 2,
      },
    },
    {
      description: "exact score with 4+ total goals gets high scoring bonus",
      appliedRules: [
        "WinnerDraw (+2)",
        "TeamGoals (+1 if any team goals match)",
        "ExactScore (+1)",
        "HighScoringMatch (+1 if 4+ goals and exact score)",
      ],
      prediction: { awayScore: 3, homeScore: 1 },
      match: { awayScore: 3, homeScore: 1 },
      expectedScore: 5,
      expectedBreakdown: {
        WinnerDrawRule: 2,
        TeamGoalsRule: 1,
        ExactScoreRule: 1,
        HighScoringMatchRule: 1,
      },
    },
    {
      description: "one team goals correct, outcome wrong, but inverse consolation",
      appliedRules: ["TeamGoals (+1 if any team goals match)", "InverseResult (+1)"],
      prediction: { awayScore: 2, homeScore: 0 },
      match: { awayScore: 2, homeScore: 3 },
      expectedScore: 2,
      expectedBreakdown: {
        TeamGoalsRule: 1,
        InverseResultRule: 1,
      },
    },
    {
      description: "inverse outcome consolation only",
      appliedRules: ["InverseResult (+1)"],
      prediction: { awayScore: 0, homeScore: 2 },
      match: { awayScore: 3, homeScore: 1 },
      expectedScore: 1,
      expectedBreakdown: {
        InverseResultRule: 1,
      },
    },
    {
      description: "draw predicted and draw happens",
      appliedRules: ["WinnerDraw (+2)"],
      prediction: { awayScore: 1, homeScore: 1 },
      match: { awayScore: 0, homeScore: 0 },
      expectedScore: 2,
      expectedBreakdown: {
        WinnerDrawRule: 2,
      },
    },
    {
      description: "high scoring match bonus only when match has 4+ goals and outcome correct",
      appliedRules: ["WinnerDraw (+2)", "HighScoringMatch (+1 if 4+ goals and outcome correct)"],
      prediction: { awayScore: 4, homeScore: 0 },
      match: { awayScore: 3, homeScore: 1 },
      expectedScore: 2,
      expectedBreakdown: {
        WinnerDrawRule: 2,
      },
    },
  ];

  for (const testCase of cases) {
    it(`${testCase.description} | rules: ${testCase.appliedRules.join(" + ")}`, () => {
      const prediction = makePrediction({
        ...ids,
        awayScore: testCase.prediction.awayScore,
        homeScore: testCase.prediction.homeScore,
      });

      const result = prediction.calculateScore(testCase.match.awayScore, testCase.match.homeScore, 0);

      expect(prediction.earnedPoints).toBe(testCase.expectedScore);
      expect(result.total).toBe(testCase.expectedScore);
      expect(asMap(result.breakdown)).toEqual(testCase.expectedBreakdown);
    });
  }

  it("should add streak bonus points to earnedPoints", () => {
    const prediction = makePrediction({
        ...ids,
        awayScore: 2,
        homeScore: 1,
      });

      const streakBonus = 2;
      const result = prediction.calculateScore(2, 1, streakBonus);

      // 4 (exact) + 2 (streak) = 6
      expect(prediction.earnedPoints).toBe(6);
      expect(result.total).toBe(4); // result.total is just ruleset total
  });
});
