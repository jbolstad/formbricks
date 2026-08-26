import { describe, expect, test } from "vitest";
import { TSurveyBlock } from "@formbricks/types/surveys/blocks";
import {
  formatShufflePoolLabel,
  getNextShufflePoolId,
  getShufflePoolIds,
  getShufflePoolSummary,
} from "./shuffle-pools";
import { blockHasShuffleAndJumpConflict, surveyHasShuffleAndJumpConflict } from "./shuffle-warning";

describe("shuffle-pools", () => {
  test("collects and labels pool ids", () => {
    const blocks = [
      { id: "1", shufflePoolId: "pool-a" },
      { id: "2", shufflePoolId: "pool-b" },
      { id: "3", shufflePoolId: "pool-a" },
    ] as TSurveyBlock[];

    expect(getShufflePoolIds(blocks)).toEqual(["pool-a", "pool-b"]);
    expect(formatShufflePoolLabel("pool-a")).toBe("Pool A");
    expect(getNextShufflePoolId(blocks)).toBe("pool-c");
    expect(getShufflePoolSummary(blocks)).toEqual([
      { poolId: "pool-a", count: 2 },
      { poolId: "pool-b", count: 1 },
    ]);
  });
});

describe("shuffle-warning", () => {
  test("detects pooled block with jump logic", () => {
    const blocks = [
      {
        id: "pooled",
        shufflePoolId: "pool-a",
        logic: [
          {
            id: "logic-1",
            conditions: { id: "c1", connector: "and", conditions: [] },
            actions: [{ id: "a1", objective: "jumpToBlock", target: "other" }],
          },
        ],
      },
      { id: "other" },
    ] as TSurveyBlock[];

    const pooledBlockIds = new Set(["pooled"]);
    expect(blockHasShuffleAndJumpConflict(blocks[0], pooledBlockIds)).toBe(true);
    expect(surveyHasShuffleAndJumpConflict({ blocks } as any)).toBe(true);
  });

  test("returns false when no pools are configured", () => {
    expect(
      surveyHasShuffleAndJumpConflict({
        blocks: [
          {
            id: "a",
            logic: [
              {
                id: "logic-1",
                conditions: { id: "c1", connector: "and", conditions: [] },
                actions: [{ id: "a1", objective: "jumpToBlock", target: "b" }],
              },
            ],
          },
        ],
      } as any)
    ).toBe(false);
  });
});
