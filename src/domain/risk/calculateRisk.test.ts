import { describe, expect, it } from "vitest";

import type {
  AssessmentAnswerValue,
  QuestionResponse,
} from "../models";

import { assessmentQuestions } from "../questionnaire";

import {
  calculateRisk,
  getRiskLevel,
} from "./calculateRisk";

// Creates a complete answer set for testing.
function createAnswers(
  answer: AssessmentAnswerValue
): Record<string, QuestionResponse> {
  const answers: Record<string, QuestionResponse> = {};

  for (const question of assessmentQuestions) {
    answers[question.id] = { answer };
  }

  return answers;
}

describe("VendorLens risk scoring", () => {
  it("contains 12 questions with a total weight of 100", () => {
    const totalWeight = assessmentQuestions.reduce(
      (total, question) => total + question.weight,
      0
    );

    expect(assessmentQuestions).toHaveLength(12);
    expect(totalWeight).toBe(100);
  });

  it("returns zero risk when every control is implemented", () => {
    const result = calculateRisk(createAnswers("yes"));

    expect(result.score).toBe(0);
    expect(result.level).toBe("low");
    expect(result.recommendations).toHaveLength(0);
  });

  it("returns maximum risk when no controls are implemented", () => {
    const result = calculateRisk(createAnswers("no"));

    expect(result.score).toBe(100);
    expect(result.level).toBe("high");
    expect(result.recommendations).toHaveLength(12);
  });

  it("assigns half of the question weight to unknown answers", () => {
    const result = calculateRisk(createAnswers("unknown"));

    expect(result.score).toBe(50);
    expect(result.level).toBe("medium");

    expect(result.categoryScores.security).toBe(50);
    expect(result.categoryScores.privacy).toBe(50);
    expect(result.categoryScores.compliance).toBe(50);
    expect(
      result.categoryScores["operational-resilience"]
    ).toBe(50);
  });

  it("calculates weighted risks correctly", () => {
    const answers = createAnswers("yes");

    answers["sec-mfa"] = { answer: "no" };
    answers["sec-access-control"] = {
      answer: "unknown",
    };

    const result = calculateRisk(answers);

    // 10 points for No + 4 points for Unknown.
    expect(result.score).toBe(14);

    // Security category: 14 risk points out of 35.
    expect(result.categoryScores.security).toBe(40);

    expect(result.level).toBe("low");
    expect(result.recommendations).toHaveLength(2);
  });

  it("rejects incomplete assessments", () => {
    const answers = createAnswers("yes");

    delete answers["sec-mfa"];

    expect(() => calculateRisk(answers)).toThrow(
      "Missing or invalid responses"
    );
  });

  it("rejects unknown question IDs", () => {
    const answers = createAnswers("yes");

    answers["invalid-question"] = {
      answer: "no",
    };

    expect(() => calculateRisk(answers)).toThrow(
      "Unknown question IDs"
    );
  });
});

describe("Risk classification thresholds", () => {
  it("classifies scores below 30 as low risk", () => {
    expect(getRiskLevel(29.5)).toBe("low");
  });

  it("classifies scores from 30 to below 60 as medium risk", () => {
    expect(getRiskLevel(30)).toBe("medium");
    expect(getRiskLevel(59.5)).toBe("medium");
  });

  it("classifies scores of 60 or above as high risk", () => {
    expect(getRiskLevel(60)).toBe("high");
    expect(getRiskLevel(100)).toBe("high");
  });
});
