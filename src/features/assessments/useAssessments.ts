import { useCallback, useEffect, useRef, useState } from "react";

import type {
  Assessment,
  QuestionResponse,
  RiskResult,
} from "../../domain/models";

import {
  completeAssessment as completeAssessmentRequest,
  createAssessment,
  fetchAssessments,
  saveAssessmentAnswer,
} from "../../lib/api/assessments";

// Convert different kinds of errors into readable messages.
function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "An unexpected error occurred.";
}

export function useAssessments() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  // Keep answer saves for each assessment in a queue.
  const saveQueues = useRef(new Map<string, Promise<void>>());

  // LOAD: Retrieve assessments from PostgreSQL when the hook mounts.
  useEffect(() => {
    let isCurrent = true;

    async function loadData() {
      try {
        const data = await fetchAssessments();

        if (isCurrent) {
          setAssessments(data);
          setError(null);
        }
      } catch (error) {
        if (isCurrent) {
          setError(getErrorMessage(error));
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    void loadData();

    return () => {
      isCurrent = false;
    };
  }, []);

  // CREATE: Start a new draft in PostgreSQL.
  const startAssessment = useCallback(async (vendorId: string) => {
    try {
      const newAssessment = await createAssessment(vendorId);

      setAssessments((current) => [
        newAssessment,
        ...current,
      ]);

      setError(null);

      return newAssessment;
    } catch (error) {
      setError(getErrorMessage(error));
      throw error;
    }
  }, []);

  // UPDATE: Save an individual answer in PostgreSQL.
  const updateAnswer = useCallback(
    async (
      assessmentId: string,
      questionId: string,
      response: QuestionResponse
    ) => {
      // Wait for previous answer saves for this assessment.
      const previousSave =
        saveQueues.current.get(assessmentId) ?? Promise.resolve();

      const currentSave = previousSave
        .catch(() => undefined)
        .then(async () => {
          const updatedAssessment = await saveAssessmentAnswer(
            assessmentId,
            questionId,
            response
          );

          // Synchronise React state with the server response.
          setAssessments((current) =>
            current.map((assessment) =>
              assessment.id === assessmentId
                ? updatedAssessment
                : assessment
            )
          );
        });

      saveQueues.current.set(assessmentId, currentSave);

      try {
        await currentSave;
        setError(null);
      } catch (error) {
        setError(getErrorMessage(error));
        throw error;
      } finally {
        // Remove the queue once the last pending save has finished.
        if (saveQueues.current.get(assessmentId) === currentSave) {
          saveQueues.current.delete(assessmentId);
        }
      }
    },
    []
  );

  // COMPLETE: Ask the backend to calculate and save the final result.
  const completeAssessment = useCallback(
    async (assessmentId: string): Promise<RiskResult> => {
      try {
        // Wait until all previously queued answer saves finish.
        const pendingSave = saveQueues.current.get(assessmentId);

        if (pendingSave) {
          await pendingSave;
        }

        const completedAssessment =
          await completeAssessmentRequest(assessmentId);

        if (!completedAssessment.result) {
          throw new Error(
            "The server completed the assessment but returned no risk result."
          );
        }

        setAssessments((current) =>
          current.map((assessment) =>
            assessment.id === assessmentId
              ? completedAssessment
              : assessment
          )
        );

        setError(null);

        return completedAssessment.result;
      } catch (error) {
        setError(getErrorMessage(error));
        throw error;
      }
    },
    []
  );

  return {
    assessments,
    isLoading,
    error,
    startAssessment,
    updateAnswer,
    completeAssessment,
  };
}
