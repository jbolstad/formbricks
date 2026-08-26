export type TInputModality = "pointer" | "keyboard";

/** Keys that mean the respondent is navigating with the keyboard (show focus rings). */
export const KEYBOARD_MODALITY_KEYS = new Set([
  "Tab",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "Home",
  "End",
]);

const isOptionControl = (el: HTMLElement): boolean => {
  if (el instanceof HTMLInputElement) {
    return el.type === "radio" || el.type === "checkbox";
  }

  const role = el.getAttribute("role");
  return role === "radio" || role === "checkbox";
};

/**
 * While focus rings are hidden (pointer modality), Space/Enter must not select the
 * autofocused option — that would answer an invisibly focused control. The first
 * such keystroke should still be treated as keyboard intent (caller turns rings on)
 * so the next Space/Enter can select. Text entry and other controls are left alone.
 */
export const shouldBlockActivationForInvisibleFocus = (
  event: Pick<KeyboardEvent, "key" | "altKey" | "ctrlKey" | "metaKey">,
  modality: TInputModality,
  activeElement: Element | null,
  surveyRoot: Element | null
): boolean => {
  if (modality === "keyboard") return false;
  if (event.altKey || event.ctrlKey || event.metaKey) return false;
  if (event.key !== "Enter" && event.key !== " ") return false;
  if (!(activeElement instanceof HTMLElement)) return false;
  if (!surveyRoot?.contains(activeElement)) return false;

  return isOptionControl(activeElement);
};
