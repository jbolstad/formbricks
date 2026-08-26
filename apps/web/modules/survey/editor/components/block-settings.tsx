"use client";

import * as Collapsible from "@radix-ui/react-collapsible";
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { TI18nString } from "@formbricks/types/i18n";
import { TSurveyBlock } from "@formbricks/types/surveys/blocks";
import { TSurvey } from "@formbricks/types/surveys/types";
import { TUserLocale } from "@formbricks/types/user";
import { addMultiLanguageLabels, extractLanguageCodes } from "@/lib/i18n/utils";
import { ElementFormInput } from "@/modules/survey/components/element-form-input";
import {
  SHUFFLE_POOL_NEW,
  SHUFFLE_POOL_NONE,
  formatShufflePoolLabel,
  getNextShufflePoolId,
  getShufflePoolIds,
} from "@/modules/survey/editor/lib/shuffle-pools";
import { AdvancedOptionToggle } from "@/modules/ui/components/advanced-option-toggle";
import { Label } from "@/modules/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/modules/ui/components/select";

interface BlockSettingsProps {
  localSurvey: TSurvey;
  block: TSurveyBlock;
  blockIndex: number;
  selectedLanguageCode: string;
  updateBlockButtonLabel: (
    blockIndex: number,
    labelKey: "buttonLabel" | "backButtonLabel",
    labelValue: TI18nString | undefined
  ) => void;
  updateBlockAttributes: (blockId: string, updatedAttributes: Partial<TSurveyBlock>) => void;
  locale: TUserLocale;
  isStorageConfigured: boolean;
  isLastBlock: boolean;
}

export const BlockSettings = ({
  localSurvey,
  block,
  blockIndex,
  selectedLanguageCode,
  updateBlockButtonLabel,
  updateBlockAttributes,
  locale,
  isStorageConfigured,
  isLastBlock,
}: Readonly<BlockSettingsProps>) => {
  const { t } = useTranslation();

  const [open, setOpen] = useState(false);

  const shufflePoolIds = useMemo(() => getShufflePoolIds(localSurvey.blocks), [localSurvey.blocks]);

  const selectedShufflePoolValue = block.shufflePoolId?.trim() ?? SHUFFLE_POOL_NONE;

  const updateEmptyButtonLabels = (
    labelKey: "buttonLabel" | "backButtonLabel",
    labelValue: TI18nString,
    skipBlockIndex: number
  ) => {
    // Update button labels for all blocks except the one at skipBlockIndex
    localSurvey.blocks.forEach((block, index) => {
      if (index === skipBlockIndex) return;
      const currentLabel = block[labelKey];
      if (!currentLabel || currentLabel[selectedLanguageCode]?.trim() === "") {
        updateBlockButtonLabel(index, labelKey, labelValue);
      }
    });
  };

  const handleShufflePoolChange = (value: string) => {
    if (value === SHUFFLE_POOL_NONE) {
      updateBlockAttributes(block.id, { shufflePoolId: undefined });
      return;
    }

    if (value === SHUFFLE_POOL_NEW) {
      updateBlockAttributes(block.id, { shufflePoolId: getNextShufflePoolId(localSurvey.blocks) });
      return;
    }

    updateBlockAttributes(block.id, { shufflePoolId: value });
  };

  return (
    <Collapsible.Root open={open} onOpenChange={setOpen} className="w-full rounded-lg">
      <Collapsible.CollapsibleTrigger
        className="flex items-center text-sm text-slate-700"
        aria-label="Toggle advanced settings">
        {open ? <ChevronDownIcon className="mr-1 h-4 w-3" /> : <ChevronRightIcon className="mr-2 h-4 w-3" />}
        {open
          ? t("workspace.surveys.edit.hide_block_settings")
          : t("workspace.surveys.edit.show_block_settings")}
      </Collapsible.CollapsibleTrigger>
      <Collapsible.CollapsibleContent>
        <div className="mt-2 space-y-4">
          <AdvancedOptionToggle
            htmlId={`shuffle-elements-${block.id}`}
            isChecked={block.shuffleElements ?? false}
            onToggle={(checked) => {
              updateBlockAttributes(block.id, {
                shuffleElements: checked ? true : undefined,
              });
            }}
            title={t("workspace.surveys.edit.randomize_question_order")}
            description={t("workspace.surveys.edit.randomize_question_order_description")}
          />

          <div className="space-y-2">
            <Label htmlFor={`shuffle-pool-${block.id}`} className="text-sm font-medium text-slate-700">
              {t("workspace.surveys.edit.card_shuffle_pool")}
            </Label>
            <Select value={selectedShufflePoolValue} onValueChange={handleShufflePoolChange}>
              <SelectTrigger id={`shuffle-pool-${block.id}`} className="w-full">
                <SelectValue placeholder={t("workspace.surveys.edit.card_shuffle_pool_none")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SHUFFLE_POOL_NONE}>
                  {t("workspace.surveys.edit.card_shuffle_pool_none")}
                </SelectItem>
                {shufflePoolIds.map((poolId) => (
                  <SelectItem key={poolId} value={poolId}>
                    {formatShufflePoolLabel(poolId)}
                  </SelectItem>
                ))}
                <SelectItem value={SHUFFLE_POOL_NEW}>
                  {t("workspace.surveys.edit.card_shuffle_pool_new")}
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500">
              {t("workspace.surveys.edit.card_shuffle_pool_description")}
            </p>
          </div>

          <div className="flex gap-x-2">
            {blockIndex !== 0 && (
              <ElementFormInput
                id="backButtonLabel"
                value={block.backButtonLabel}
                label={t("workspace.surveys.edit.back_button_label")}
                localSurvey={localSurvey}
                elementIdx={blockIndex}
                isInvalid={false}
                updateElement={(_, updatedAttributes) => {
                  if ("backButtonLabel" in updatedAttributes) {
                    const backButtonLabel = updatedAttributes.backButtonLabel as TI18nString;
                    updateBlockButtonLabel(blockIndex, "backButtonLabel", {
                      ...block.backButtonLabel,
                      [selectedLanguageCode]: backButtonLabel[selectedLanguageCode],
                    });
                  }
                }}
                placeholder={t("common.back")}
                locale={locale}
                isStorageConfigured={isStorageConfigured}
                onBlur={(e) => {
                  const languageSymbols = extractLanguageCodes(localSurvey.languages ?? []);
                  const existingLabel = block.backButtonLabel || {};
                  const translatedBackButtonLabel = addMultiLanguageLabels(
                    {
                      ...existingLabel,
                      [selectedLanguageCode]: e.target.value,
                    },
                    languageSymbols
                  );
                  updateBlockButtonLabel(blockIndex, "backButtonLabel", translatedBackButtonLabel);
                  updateEmptyButtonLabels("backButtonLabel", translatedBackButtonLabel, blockIndex);
                }}
              />
            )}
            <ElementFormInput
              id="buttonLabel"
              value={block.buttonLabel}
              label={t("workspace.surveys.edit.button_label")}
              localSurvey={localSurvey}
              elementIdx={blockIndex}
              isInvalid={false}
              updateElement={(_, updatedAttributes) => {
                if ("buttonLabel" in updatedAttributes) {
                  const languageSymbols = extractLanguageCodes(localSurvey.languages ?? []);
                  const buttonLabel = updatedAttributes.buttonLabel as TI18nString;
                  const existingLabel = block.buttonLabel || {};
                  const updatedButtonLabel = addMultiLanguageLabels(
                    {
                      ...existingLabel,
                      [selectedLanguageCode]: buttonLabel[selectedLanguageCode],
                    },
                    languageSymbols
                  );
                  updateBlockButtonLabel(blockIndex, "buttonLabel", updatedButtonLabel);
                }
              }}
              placeholder={t("common.next")}
              locale={locale}
              isStorageConfigured={isStorageConfigured}
              onBlur={(e) => {
                const languageSymbols = extractLanguageCodes(localSurvey.languages ?? []);
                const existingLabel = block.buttonLabel || {};
                const translatedNextButtonLabel = addMultiLanguageLabels(
                  {
                    ...existingLabel,
                    [selectedLanguageCode]: e.target.value,
                  },
                  languageSymbols
                );
                updateBlockButtonLabel(blockIndex, "buttonLabel", translatedNextButtonLabel);
                // Don't propagate to last block
                const lastBlockIndex = localSurvey.blocks.length - 1;
                if (blockIndex !== lastBlockIndex && !isLastBlock) {
                  updateEmptyButtonLabels("buttonLabel", translatedNextButtonLabel, lastBlockIndex);
                }
              }}
            />
          </div>
        </div>
      </Collapsible.CollapsibleContent>
    </Collapsible.Root>
  );
};
