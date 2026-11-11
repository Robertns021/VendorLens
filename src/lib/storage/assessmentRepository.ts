import type { Assessment } from "../../domain/models";

const STORAGE_KEY = "vendorlens.assessments.v1";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isAssessment(value: unknown): value is Assessment {
  if (!isObject(value) || !isObject(value.answers)) {
    return false;
  }

  const validAnswers = Object.values(value.answers).every(
    (response) =>
      isObject(response) &&
      ["yes", "no", "unknown"].includes(String(response.answer)) &&
      (
        response.evidenceNote === undefined ||
        typeof response.evidenceNote === "string"
      )
  );

  const validResult =
    value.result === undefined ||
    (
      isObject(value.result) &&
      typeof value.result.score === "number" &&
      ["low", "medium", "high"].includes(String(value.result.level)) &&
      isObject(value.result.categoryScores) &&
      Array.isArray(value.result.recommendations)
    );

  return (
    typeof value.id === "string" &&
    typeof value.vendorId === "string" &&
    typeof value.questionnaireVersion === "number" &&
    (value.status === "draft" || value.status === "completed") &&
    typeof value.createdAt === "string" &&
    validAnswers &&
    validResult
  );
}

export function loadAssessments(): Assessment[] {
  try {
    if (typeof window === "undefined") {
      return [];
    }

    const savedData = window.localStorage.getItem(STORAGE_KEY);

    if (!savedData) {
      return [];
    }

    const parsedData: unknown = JSON.parse(savedData);

    if (
      Array.isArray(parsedData) &&
      parsedData.every(isAssessment)
    ) {
      return parsedData;
    }

    console.warn("Invalid assessment data found in storage.");
    return [];
  } catch (error) {
    console.error("Could not load assessments:", error);
    return [];
  }
}

export function saveAssessments(
  assessments: Assessment[]
): void {
  try {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(assessments)
    );
  } catch (error) {
    console.error("Could not save assessments:", error);
  }
}
