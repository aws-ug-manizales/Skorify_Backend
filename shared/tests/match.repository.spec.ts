import { MatchEntity } from "@skorify/domain/match";
import { MatchRepository } from "../src/repositories/match.repository";
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
  return new MatchRepository(new InMemoryDataSource<MatchEntity>());
}

const id1 = "a1b2c3d4-e5f6-7890-abcd-ef1234567890" as const;
const id2 = "b2c3d4e5-f6a7-8901-bcde-f12345678901" as const;

function buildMatch1(): MatchEntity {
  return MatchEntity.build({
    id: id1,
    homeTeamId: "aaa00001-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
    awayTeamId: "bbb00002-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
    tournamentId: "ttt00001-tttt-tttt-tttt-tttttttttttt",
    kickOff: new Date("2026-06-15T20:00:00Z"),
    createdAt: new Date(),
  });
}

function buildMatch2(): MatchEntity {
  return MatchEntity.build({
    id: id2,
    homeTeamId: "ccc00003-cccc-cccc-cccc-cccccccccccc",
    awayTeamId: "ddd00004-dddd-dddd-dddd-dddddddddddd",
    tournamentId: "ttt00001-tttt-tttt-tttt-tttttttttttt",
    kickOff: new Date("2026-06-16T18:00:00Z"),
    createdAt: new Date(),
  });
}

// ---------------------------------------------------------------------------
// save()
// ---------------------------------------------------------------------------
describe("MatchRepository – save()", () => {
  it("persists a new match and returns it", async () => {
    const repo = makeRepo();
    const match = buildMatch1();

    const result = await repo.save(match);

    expect(result).not.toBeNull();
    expect(result!.id).toBe(id1);
  });

  it("overwrites an existing match with the same id", async () => {
    const repo = makeRepo();
    const match = buildMatch1();
    await repo.save(match);

    match.setScores(2, 1);
    await repo.save(match);

    const all = await repo.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].homeTeamScore).toBe(1);
    expect(all[0].awayTeamScore).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// getById()
// ---------------------------------------------------------------------------
describe("MatchRepository – getById()", () => {
  it("returns the match when it exists", async () => {
    const repo = makeRepo();
    await repo.save(buildMatch1());

    const found = await repo.getById(id1);

    expect(found).not.toBeNull();
    expect(found!.id).toBe(id1);
  });

  it("returns null when the match does not exist", async () => {
    const repo = makeRepo();

    const found = await repo.getById("00000000-0000-0000-0000-000000000000");

    expect(found).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// getAll()
// ---------------------------------------------------------------------------
describe("MatchRepository – getAll()", () => {
  it("returns an empty array when the repository is empty", async () => {
    const repo = makeRepo();

    expect(await repo.getAll()).toEqual([]);
  });

  it("returns all saved matches", async () => {
    const repo = makeRepo();
    await repo.save(buildMatch1());
    await repo.save(buildMatch2());

    const all = await repo.getAll();

    expect(all).toHaveLength(2);
    expect(all.map((m) => m.id)).toEqual(expect.arrayContaining([id1, id2]));
  });
});

// ---------------------------------------------------------------------------
// getByIDs()
// ---------------------------------------------------------------------------
describe("MatchRepository – getByIDs()", () => {
  it("returns only the matches whose IDs are requested", async () => {
    const repo = makeRepo();
    await repo.save(buildMatch1());
    await repo.save(buildMatch2());

    const result = await repo.getByIDs([id1]);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(id1);
  });

  it("returns an empty array when no IDs match", async () => {
    const repo = makeRepo();
    await repo.save(buildMatch1());

    const result = await repo.getByIDs(["00000000-0000-0000-0000-000000000000"]);

    expect(result).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// modifyById()
// ---------------------------------------------------------------------------
describe("MatchRepository – modifyById()", () => {
  it("updates the match and returns the updated version", async () => {
    const repo = makeRepo();
    const match = buildMatch1();
    await repo.save(match);

    match.setScores(3, 0);
    const updated = await repo.modifyById(id1, match);

    expect(updated).not.toBeNull();
    expect(updated!.awayTeamScore).toBe(3);
    expect(updated!.homeTeamScore).toBe(0);
  });

  it("returns null when the match does not exist", async () => {
    const repo = makeRepo();

    const result = await repo.modifyById("00000000-0000-0000-0000-000000000000", buildMatch1());

    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// deleteById()
// ---------------------------------------------------------------------------
describe("MatchRepository – deleteById()", () => {
  it("removes the match and returns it", async () => {
    const repo = makeRepo();
    await repo.save(buildMatch1());
    await repo.save(buildMatch2());

    const deleted = await repo.deleteById(id1);

    expect(deleted).not.toBeNull();
    expect(deleted!.id).toBe(id1);
    expect(await repo.getAll()).toHaveLength(1);
  });

  it("returns null when the match does not exist", async () => {
    const repo = makeRepo();

    const result = await repo.deleteById("00000000-0000-0000-0000-000000000000");

    expect(result).toBeNull();
  });
});

