import type {
  Assessment,
  QuestionResponse,
} from "../../domain/models";

// Use the same API address as the vendor service.
const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001"
).replace(/\/+$/, "");

// Generic function for sending HTTP requests.
async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  let data: unknown = null;

  try {
    data = await response.json();
  } catch {
    // Some HTTP responses don't contain JSON.
  }

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    if (typeof data === "object" && data !== null && "error" in data) {
      const serverError = data.error;

      if (typeof serverError === "string") {
        message = serverError;
      }
    }

    throw new Error(message);
  }

  return data as T;
}

// GET: retrieve all assessments.
export async function fetchAssessments(): Promise<Assessment[]> {
  const response = await request<{ assessments: Assessment[] }>(
    "/api/assessments"
  );

  return response.assessments;
}

// POST: start a new assessment.
export async function createAssessment(
  vendorId: string
): Promise<Assessment> {
  const response = await request<{ assessment: Assessment }>(
    "/api/assessments",
    {
      method: "POST",
      body: JSON.stringify({ vendorId }),
    }
  );

  return response.assessment;
}

// PUT: save or update an individual answer.
export async function saveAssessmentAnswer(
  assessmentId: string,
  questionId: string,
  response: QuestionResponse
): Promise<Assessment> {
  const result = await request<{ assessment: Assessment }>(
    `/api/assessments/${encodeURIComponent(assessmentId)}/answers/${encodeURIComponent(questionId)}`,
    {
      method: "PUT",
      body: JSON.stringify(response),
    }
  );

  return result.assessment;
}

// POST: complete assessment and retrieve server-calculated results.
export async function completeAssessment(
  assessmentId: string
): Promise<Assessment> {
  const response = await request<{ assessment: Assessment }>(
    `/api/assessments/${encodeURIComponent(assessmentId)}/complete`,
    {
      method: "POST",
    }
  );

  return response.assessment;
}
