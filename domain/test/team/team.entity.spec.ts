import { TeamEntity } from "../../src/features/team/team.entity";
import type { Id } from "../../src/core/entity";

const teamId: Id = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";

// ---------------------------------------------------------------------------
// build()
// ---------------------------------------------------------------------------
describe("TeamEntity – build()", () => {
  it("creates a team with the given name", () => {
    const team = TeamEntity.build({ id: teamId, name: "Real Madrid" });

    expect(team).not.toBeNull();
    expect(team!.name).toBe("Real Madrid");
  });

  it("stores the provided id", () => {
    const team = TeamEntity.build({ id: teamId, name: "Barcelona" });

    expect(team!.id).toBe(teamId);
  });

  it("stores shieldUrl when provided", () => {
    const url = "https://example.com/shield.png";
    const team = TeamEntity.build({ id: teamId, name: "Atletico", shieldUrl: url });

    expect(team!.shieldUrl).toBe(url);
  });

  it("leaves shieldUrl undefined when not provided", () => {
    const team = TeamEntity.build({ id: teamId, name: "Sevilla" });

    expect(team!.shieldUrl).toBeUndefined();
  });
});
