import { PredictionEntity } from "../../src/features/prediction/prediction.entity";
import { PredictionRuleBreakdown } from "../../src/features/prediction/scoreRules/prediction-score.ruleset";

function makePrediction(params: {
  predictionId: string;
  userId: string;
  matchId: string;
  awayTeamScore: number;
  localTeamScore: number;
}): PredictionEntity {
  return PredictionEntity.build({
    id: params.predictionId as any,
    userId: params.userId as any,
    matchId: params.matchId as any,
    awayTeamScore: params.awayTeamScore,
    localTeamScore: params.localTeamScore,
  });
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
    matchId: "33333333-3333-3333-3333-333333333333",
  };

  const cases: Array<{
    description: string;
    appliedRules: string[];
    prediction: { awayTeamScore: number; localTeamScore: number };
    match: { awayTeamScore: number; localTeamScore: number };
    expectedScore: number;
    expectedBreakdown: Record<string, number>;
  }> = [
    {
      description: "exact score + outcome correct",
      appliedRules: ["WinnerDraw (+2)", "TeamGoals (+1 if any team goals match)", "ExactScore (+1)"],
      prediction: { awayTeamScore: 2, localTeamScore: 1 },
      match: { awayTeamScore: 2, localTeamScore: 1 },
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
      prediction: { awayTeamScore: 1, localTeamScore: 0 },
      match: { awayTeamScore: 3, localTeamScore: 1 },
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
      prediction: { awayTeamScore: 3, localTeamScore: 1 },
      match: { awayTeamScore: 3, localTeamScore: 1 },
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
      prediction: { awayTeamScore: 2, localTeamScore: 0 },
      match: { awayTeamScore: 2, localTeamScore: 3 },
      expectedScore: 2,
      expectedBreakdown: {
        TeamGoalsRule: 1,
        InverseResultRule: 1,
      },
    },
    {
      description: "inverse outcome consolation only",
      appliedRules: ["InverseResult (+1)"],
      prediction: { awayTeamScore: 0, localTeamScore: 2 },
      match: { awayTeamScore: 3, localTeamScore: 1 },
      expectedScore: 1,
      expectedBreakdown: {
        InverseResultRule: 1,
      },
    },
    {
      description: "draw predicted and draw happens",
      appliedRules: ["WinnerDraw (+2)"],
      prediction: { awayTeamScore: 1, localTeamScore: 1 },
      match: { awayTeamScore: 0, localTeamScore: 0 },
      expectedScore: 2,
      expectedBreakdown: {
        WinnerDrawRule: 2,
      },
    },
    {
      description: "high scoring match bonus only when match has 4+ goals and outcome correct",
      appliedRules: ["WinnerDraw (+2)", "HighScoringMatch (+1 if 4+ goals and outcome correct)"],
      prediction: { awayTeamScore: 4, localTeamScore: 0 },
      match: { awayTeamScore: 3, localTeamScore: 1 },
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
        awayTeamScore: testCase.prediction.awayTeamScore,
        localTeamScore: testCase.prediction.localTeamScore,
      });

      const result = prediction.calculateScore(testCase.match.awayTeamScore, testCase.match.localTeamScore);

      expect(prediction.score).toBe(testCase.expectedScore);
      expect(result.total).toBe(testCase.expectedScore);
      expect(asMap(result.breakdown)).toEqual(testCase.expectedBreakdown);
    });
  }
});
