import type {
  AssessmentCategory,
  QuestionResponse,
  RiskLevel,
  RiskRecommendation,
  RiskResult,
} from "../models";

import { assessmentQuestions } from "../questionnaire";

const categories: AssessmentCategory[] = [
  "security",
  "privacy",
  "compliance",
  "operational-resilience",
];

function roundScore(value: number): number {
  return Math.round(value * 10) / 10;
}

export function getRiskLevel(score: number): RiskLevel {
  if (score < 30) {
    return "low";
  }

  if (score < 60) {
    return "medium";
  }

  return "high";
}

export function calculateRisk(
  answers: Record<string, QuestionResponse>
): RiskResult {
  const validQuestionIds = new Set(
    assessmentQuestions.map((question) => question.id)
  );

  // Reject answers that do not belong to this questionnaire.
  const unknownIds = Object.keys(answers).filter(
    (id) => !validQuestionIds.has(id)
  );

  if (unknownIds.length > 0) {
    throw new Error(
      `Unknown question IDs: ${unknownIds.join(", ")}`
    );
  }

  // Ensure every question has a valid answer.
  const incompleteQuestions = assessmentQuestions.filter(
    (question) => {
      const answer = answers[question.id]?.answer;

      return (
        answer !== "yes" &&
        answer !== "no" &&
        answer !== "unknown"
      );
    }
  );

  if (incompleteQuestions.length > 0) {
    throw new Error(
      `Missing or invalid responses for: ${
        incompleteQuestions.map((question) => question.id).join(", ")
      }`
    );
  }

  let totalRiskPoints = 0;

  const categoryRiskPoints: Record<
    AssessmentCategory,
    number
  > = {
    security: 0,
    privacy: 0,
    compliance: 0,
    "operational-resilience": 0,
  };

  const categoryWeights: Record<
    AssessmentCategory,
    number
  > = {
    security: 0,
    privacy: 0,
    compliance: 0,
    "operational-resilience": 0,
  };

  const recommendations: RiskRecommendation[] = [];

  for (const question of assessmentQuestions) {
    const answer = answers[question.id].answer;

    let multiplier = 0;

    if (answer === "no") {
      multiplier = 1;
    } else if (answer === "unknown") {
      multiplier = 0.5;
    }

    const riskPoints = question.weight * multiplier;

    totalRiskPoints += riskPoints;

    categoryRiskPoints[question.category] += riskPoints;
    categoryWeights[question.category] += question.weight;

    if (answer !== "yes") {
      recommendations.push({
        questionId: question.id,
        category: question.category,
        answer,
        title: question.title,
        action: question.recommendations[answer],
      });
    }
  }

  const score = roundScore(totalRiskPoints);

  const categoryScores = {} as Record<
    AssessmentCategory,
    number
  >;

  for (const category of categories) {
    categoryScores[category] = roundScore(
      (categoryRiskPoints[category] /
        categoryWeights[category]) *
        100
    );
  }

  return {
    score,
    level: getRiskLevel(score),
    categoryScores,
    recommendations,
  };
}
