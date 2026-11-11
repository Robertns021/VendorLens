import { useCallback, useEffect, useState } from "react";

import type {
  Assessment,
  QuestionResponse,
  RiskResult,
} from "../../domain/models";

import {
  loadAssessments,
  saveAssessments,
} from "../../lib/storage/assessmentRepository";

import { calculateRisk } from "../../domain/risk/calculateRisk";

function generateAssessmentId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `assessment-${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}`;
}

export function useAssessments() {
  const [assessments, setAssessments] =
    useState<Assessment[]>(loadAssessments);

  // Persist assessment changes.
  useEffect(() => {
    saveAssessments(assessments);
  }, [assessments]);

  // CREATE: Start a new draft.
  const startAssessment = useCallback(
    (vendorId: string): Assessment => {
      const newAssessment: Assessment = {
        id: generateAssessmentId(),
        vendorId,
        questionnaireVersion: 1,
        status: "draft",
        answers: {},
        createdAt: new Date().toISOString(),
      };

      setAssessments((current) => [
        newAssessment,
        ...current,
      ]);

      return newAssessment;
    },
    []
  );

  // UPDATE: Save an answer.
  const updateAnswer = useCallback(
    (
      assessmentId: string,
      questionId: string,
      response: QuestionResponse
    ) => {
      setAssessments((current) =>
        current.map((assessment) => {
          if (
            assessment.id !== assessmentId ||
            assessment.status !== "draft"
          ) {
            return assessment;
          }

          return {
            ...assessment,
            answers: {
              ...assessment.answers,
              [questionId]: response,
            },
          };
        })
      );
    },
    []
  );

  // COMPLETE: Calculate and save the final result.
  const completeAssessment = useCallback(
    (assessmentId: string): RiskResult => {
      const assessment = assessments.find(
        (item) => item.id === assessmentId
      );

      if (!assessment) {
        throw new Error("Assessment could not be found.");
      }

      if (assessment.status !== "draft") {
        throw new Error("This assessment is already completed.");
      }

      // This throws an error if any question is unanswered.
      const result = calculateRisk(assessment.answers);

      const completedAt = new Date().toISOString();

      setAssessments((current) =>
        current.map((item) =>
          item.id === assessmentId
            ? {
                ...item,
                status: "completed",
                completedAt,
                result,
              }
            : item
        )
      );

      return result;
    },
    [assessments]
  );

  return {
    assessments,
    startAssessment,
    updateAnswer,
    completeAssessment,
  };
}
