import { describe, expect, it, beforeEach } from "vitest";
import {
  buildAdaptivePlan,
  markReviewCompleted,
  reviewDue,
} from "./studyEngine";
const store = new Map<string, string>();
Object.defineProperty(globalThis, "localStorage", {
  value: {
    clear: () => store.clear(),
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, value),
  },
});

describe("study engine", () => {
  beforeEach(() => localStorage.clear());
  it("prioritizes a weak quiz subject within the preferred track", () => {
    const result = buildAdaptivePlan(
      { interests: ["Numerasi"], preferredTrack: "Numerasi" },
      [],
      [{ quizKey: "fungsi-kuadrat", score: 2, total: 5 }],
      [
        {
          subject: "Matematika",
          title: "Fungsi Kuadrat",
          track: "Numerasi",
          level: "SMK",
        },
        { subject: "Bahasa", title: "Literasi", track: "Bahasa", level: "SMK" },
      ]
    );
    expect(result[0]?.subject).toBe("Matematika");
  });
  it("creates a due review after an interval", () => {
    markReviewCompleted("fungsi-kuadrat");
    const last = Number(
      localStorage.getItem("temanbelajar_review_fungsi-kuadrat")
    );
    expect(reviewDue("fungsi-kuadrat", last + 2 * 86_400_000 + 1)).toBe(true);
  });
});
