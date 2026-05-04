import { TeamEntity } from "@skorify/domain/team";
import { TeamRepository } from "../src/repositories/team.repository";
import { DataSource } from "../src/core";
import type { Entity } from "@skorify/domain/core";

// ---------------------------------------------------------------------------
// In-memory DataSource for testing (no file system required)
// ---------------------------------------------------------------------------
class InMemoryDataSource<T extends Entity> implements DataSource<T> {
  private store: T[] = [];

  async read(): Promise<T[]> {
    return [...this.store];
  }

  async write(data: T[]): Promise<void> {
    this.store = [...data];
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function makeRepo() {
  return new TeamRepository(new InMemoryDataSource<TeamEntity>());
}

const id1 = "aaa00001-aaaa-aaaa-aaaa-aaaaaaaaaaaa" as const;
const id2 = "bbb00002-bbbb-bbbb-bbbb-bbbbbbbbbbbb" as const;

function buildTeam1(): TeamEntity {
  return TeamEntity.build({
    id: id1,
    name: "Colombia",
    shieldUrl: "https://example.com/colombia.png",
  })!;
}

function buildTeam2(): TeamEntity {
  return TeamEntity.build({ id: id2, name: "Brasil" })!;
}

// ---------------------------------------------------------------------------
// save()
// ---------------------------------------------------------------------------
describe("TeamRepository – save()", () => {
  it("persists a new team and returns it", async () => {
    const repo = makeRepo();

    const result = await repo.save(buildTeam1());

    expect(result).not.toBeNull();
    expect(result!.id).toBe(id1);
    expect(result!.name).toBe("Colombia");
  });

  it("overwrites an existing team with the same id", async () => {
    const repo = makeRepo();
    await repo.save(buildTeam1());

    const updated = TeamEntity.build({ id: id1, name: "Colombia Updated" })!;
    await repo.save(updated);

    const all = await repo.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].name).toBe("Colombia Updated");
  });
});

// ---------------------------------------------------------------------------
// getById()
// ---------------------------------------------------------------------------
describe("TeamRepository – getById()", () => {
  it("returns the team when it exists", async () => {
    const repo = makeRepo();
    await repo.save(buildTeam1());

    const found = await repo.getById(id1);

    expect(found).not.toBeNull();
    expect(found!.id).toBe(id1);
    expect(found!.name).toBe("Colombia");
  });

  it("returns null when the team does not exist", async () => {
    const repo = makeRepo();

    const found = await repo.getById("00000000-0000-0000-0000-000000000000");

    expect(found).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// getAll()
// ---------------------------------------------------------------------------
describe("TeamRepository – getAll()", () => {
  it("returns an empty array when the repository is empty", async () => {
    const repo = makeRepo();

    expect(await repo.getAll()).toEqual([]);
  });

  it("returns all saved teams", async () => {
    const repo = makeRepo();
    await repo.save(buildTeam1());
    await repo.save(buildTeam2());

    const all = await repo.getAll();

    expect(all).toHaveLength(2);
    expect(all.map((t) => t.id)).toEqual(expect.arrayContaining([id1, id2]));
  });
});

// ---------------------------------------------------------------------------
// getByIDs()
// ---------------------------------------------------------------------------
describe("TeamRepository – getByIDs()", () => {
  it("returns only the teams whose IDs are requested", async () => {
    const repo = makeRepo();
    await repo.save(buildTeam1());
    await repo.save(buildTeam2());

    const result = await repo.getByIDs([id1]);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(id1);
  });

  it("returns an empty array when no IDs match", async () => {
    const repo = makeRepo();
    await repo.save(buildTeam1());

    const result = await repo.getByIDs(["00000000-0000-0000-0000-000000000000"]);

    expect(result).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// modifyById()
// ---------------------------------------------------------------------------
describe("TeamRepository – modifyById()", () => {
  it("updates the team and returns the updated version", async () => {
    const repo = makeRepo();
    await repo.save(buildTeam1());

    const updated = TeamEntity.build({ id: id1, name: "Colombia National Team" })!;
    const result = await repo.modifyById(id1, updated);

    expect(result).not.toBeNull();
    expect(result!.name).toBe("Colombia National Team");

    const persisted = await repo.getById(id1);
    expect(persisted!.name).toBe("Colombia National Team");
  });

  it("returns null when the team does not exist", async () => {
    const repo = makeRepo();

    const result = await repo.modifyById("00000000-0000-0000-0000-000000000000", buildTeam1());

    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// deleteById()
// ---------------------------------------------------------------------------
describe("TeamRepository – deleteById()", () => {
  it("removes the team and returns it", async () => {
    const repo = makeRepo();
    await repo.save(buildTeam1());
    await repo.save(buildTeam2());

    const deleted = await repo.deleteById(id1);

    expect(deleted).not.toBeNull();
    expect(deleted!.id).toBe(id1);
    expect(await repo.getAll()).toHaveLength(1);
  });

  it("returns null when the team does not exist", async () => {
    const repo = makeRepo();

    const result = await repo.deleteById("00000000-0000-0000-0000-000000000000");

    expect(result).toBeNull();
  });
});
