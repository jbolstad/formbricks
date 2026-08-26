import { TSurveyBlock } from "@formbricks/types/surveys/blocks";
import { TSurvey } from "@formbricks/types/surveys/types";

const getPooledBlockIds = (blocks: TSurveyBlock[]): Set<string> => {
  return new Set(blocks.filter((block) => block.shufflePoolId?.trim()).map((block) => block.id));
};

export const blockHasShuffleAndJumpConflict = (block: TSurveyBlock, pooledBlockIds: Set<string>): boolean => {
  const isPooled = Boolean(block.shufflePoolId?.trim());

  const hasJumpFromBlock =
    block.logic?.some((logicItem) =>
      logicItem.actions.some((action) => action.objective === "jumpToBlock")
    ) ?? false;

  const jumpsToPooledBlock =
    block.logic?.some((logicItem) =>
      logicItem.actions.some(
        (action) => action.objective === "jumpToBlock" && pooledBlockIds.has(action.target)
      )
    ) ?? false;

  const fallbackTargetsPooledBlock = Boolean(block.logicFallback && pooledBlockIds.has(block.logicFallback));

  return (
    (isPooled && (hasJumpFromBlock || Boolean(block.logicFallback))) ||
    jumpsToPooledBlock ||
    fallbackTargetsPooledBlock
  );
};

export const surveyHasShuffleAndJumpConflict = (survey: TSurvey): boolean => {
  const pooledBlockIds = getPooledBlockIds(survey.blocks);

  if (pooledBlockIds.size === 0) {
    return false;
  }

  return survey.blocks.some((block) => blockHasShuffleAndJumpConflict(block, pooledBlockIds));
};
