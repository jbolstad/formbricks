// @vitest-environment happy-dom
import { describe, expect, test } from "vitest";
import { shouldBlockActivationForInvisibleFocus } from "./input-modality";

const key = (keyName: string) => ({
  key: keyName,
  altKey: false,
  ctrlKey: false,
  metaKey: false,
});

describe("shouldBlockActivationForInvisibleFocus", () => {
  test("blocks Space and Enter on radios while in pointer modality", () => {
    const root = document.createElement("div");
    const radio = document.createElement("input");
    radio.type = "radio";
    root.appendChild(radio);

    expect(shouldBlockActivationForInvisibleFocus(key(" "), "pointer", radio, root)).toBe(true);
    expect(shouldBlockActivationForInvisibleFocus(key("Enter"), "pointer", radio, root)).toBe(true);
  });

  test("allows Space and Enter once keyboard modality is active", () => {
    const root = document.createElement("div");
    const radio = document.createElement("input");
    radio.type = "radio";
    root.appendChild(radio);

    expect(shouldBlockActivationForInvisibleFocus(key(" "), "keyboard", radio, root)).toBe(false);
    expect(shouldBlockActivationForInvisibleFocus(key("Enter"), "keyboard", radio, root)).toBe(false);
  });

  test("does not block typing in text inputs", () => {
    const root = document.createElement("div");
    const text = document.createElement("input");
    text.type = "text";
    root.appendChild(text);

    expect(shouldBlockActivationForInvisibleFocus(key(" "), "pointer", text, root)).toBe(false);
    expect(shouldBlockActivationForInvisibleFocus(key("Enter"), "pointer", text, root)).toBe(false);
  });

  test("ignores keys outside the survey root", () => {
    const root = document.createElement("div");
    const outside = document.createElement("input");
    outside.type = "radio";

    expect(shouldBlockActivationForInvisibleFocus(key(" "), "pointer", outside, root)).toBe(false);
  });
});
