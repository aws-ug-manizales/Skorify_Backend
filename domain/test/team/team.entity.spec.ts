import { TeamEntity } from "../../src/features/team/team.entity";
import type { Id } from "../../src/core/entity";

const teamId: Id = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";

function buildTeam(name: string, shieldUrl?: string): TeamEntity {
  const teamDE = TeamEntity.build({ id: teamId, name, shieldUrl });
  return (teamDE as any).payload as TeamEntity;
}

// ---------------------------------------------------------------------------
// build()
// ---------------------------------------------------------------------------
describe("TeamEntity – build()", () => {
  it("creates a team with the given name", () => {
    const team = buildTeam("Real Madrid");

    expect(team).not.toBeNull();
    expect(team!.name).toBe("Real Madrid");
  });

  it("stores the provided id", () => {
    const team = buildTeam("Barcelona");

    expect(team!.id).toBe(teamId);
  });

  it("stores shieldUrl when provided", () => {
    const url = "https://example.com/shield.png";
    const team = buildTeam("Atletico", url);

    expect(team!.shieldUrl).toBe(url);
  });

  it("leaves shieldUrl undefined when not provided", () => {
    const team = buildTeam("Sevilla");

    expect(team!.shieldUrl).toBeUndefined();
  });
});
