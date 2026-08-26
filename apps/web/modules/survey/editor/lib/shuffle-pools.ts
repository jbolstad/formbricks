import { createId } from "@paralleldrive/cuid2";
import { TSurveyBlock } from "@formbricks/types/surveys/blocks";

export const SHUFFLE_POOL_NONE = "__none__";
export const SHUFFLE_POOL_NEW = "__new__";

export const getShufflePoolIds = (blocks: TSurveyBlock[]): string[] => {
  const poolIds = new Set<string>();

  blocks.forEach((block) => {
    const poolId = block.shufflePoolId?.trim();
    if (poolId) {
      poolIds.add(poolId);
    }
  });

  return Array.from(poolIds).sort();
};

export const getNextShufflePoolId = (blocks: TSurveyBlock[]): string => {
  const existingPoolIds = getShufflePoolIds(blocks);

  for (const letter of "abcdefghijklmnopqrstuvwxyz") {
    const poolId = `pool-${letter}`;
    if (!existingPoolIds.includes(poolId)) {
      return poolId;
    }
  }

  return createId();
};

export const formatShufflePoolLabel = (poolId: string): string => {
  const match = poolId.match(/^pool-([a-z])$/);
  if (match) {
    return `Pool ${match[1].toUpperCase()}`;
  }

  return poolId;
};

export const getShufflePoolSummary = (blocks: TSurveyBlock[]): { poolId: string; count: number }[] => {
  const counts = new Map<string, number>();

  blocks.forEach((block) => {
    const poolId = block.shufflePoolId?.trim();
    if (!poolId) {
      return;
    }

    counts.set(poolId, (counts.get(poolId) ?? 0) + 1);
  });

  return getShufflePoolIds(blocks).map((poolId) => ({
    poolId,
    count: counts.get(poolId) ?? 0,
  }));
};
