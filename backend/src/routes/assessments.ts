import { Router } from "express";
import { z } from "zod";
import { pool } from "../db.js";

import {
  assessmentQuestions,
  calculateAssessmentRisk,
  type QuestionResponse,
  type RiskLevel,
  type AssessmentCategory,
  type RiskRecommendation,
} from "../domain/assessmentScoring.js";

export const assessmentsRouter = Router();

const uuidSchema = z.string().uuid();

const createSchema = z.object({
  vendorId: uuidSchema,
});

const answerSchema = z.object({
  answer: z.enum(["yes", "no", "unknown"]),
  evidenceNote: z.string().max(500).optional(),
});

type AssessmentRow = {
  id: string;
  vendor_id: string;
  questionnaire_version: number;
  status: "draft" | "completed";
  created_at: Date;
  completed_at: Date | null;
  score: string | null;
  risk_level: RiskLevel | null;
  category_scores: Record<AssessmentCategory, number> | null;
  recommendations: RiskRecommendation[];
  answers: Record<string, QuestionResponse>;
};

const assessmentSelect = `
  SELECT
    a.id,
    a.vendor_id,
    a.questionnaire_version,
    a.status,
    a.created_at,
    a.completed_at,
    a.score,
    a.risk_level,
    a.category_scores,
    a.recommendations,
    COALESCE(
      jsonb_object_agg(
        aa.question_id,
        jsonb_strip_nulls(
          jsonb_build_object(
            'answer', aa.answer,
            'evidenceNote', aa.evidence_note
          )
        )
      ) FILTER (WHERE aa.question_id IS NOT NULL),
      '{}'::jsonb
    ) AS answers
  FROM assessments a
  LEFT JOIN assessment_answers aa
    ON aa.assessment_id = a.id
`;

function mapAssessment(row: AssessmentRow) {
  const hasResult =
    row.status === "completed" &&
    row.score !== null &&
    row.risk_level !== null &&
    row.category_scores !== null;

  return {
    id: row.id,
    vendorId: row.vendor_id,
    questionnaireVersion: row.questionnaire_version,
    status: row.status,
    answers: row.answers,
    createdAt: row.created_at.toISOString(),
    ...(row.completed_at
      ? { completedAt: row.completed_at.toISOString() }
      : {}),
    ...(hasResult
      ? {
          result: {
            score: Number(row.score),
            level: row.risk_level,
            categoryScores: row.category_scores,
            recommendations: row.recommendations,
          },
        }
      : {}),
  };
}

async function findAssessment(id: string) {
  const result = await pool.query<AssessmentRow>(
    `${assessmentSelect}
     WHERE a.id = $1
     GROUP BY a.id`,
    [id]
  );

  return result.rows[0]
    ? mapAssessment(result.rows[0])
    : null;
}

// GET /api/assessments
assessmentsRouter.get("/", async (_req, res, next) => {
  try {
    const result = await pool.query<AssessmentRow>(
      `${assessmentSelect}
       GROUP BY a.id
       ORDER BY a.created_at DESC`
    );

    res.json({
      assessments: result.rows.map(mapAssessment),
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/assessments/:id
assessmentsRouter.get("/:id", async (req, res, next) => {
  try {
    const parsedId = uuidSchema.safeParse(req.params.id);

    if (!parsedId.success) {
      return res.status(400).json({
        error: "Invalid assessment ID",
      });
    }

    const assessment = await findAssessment(parsedId.data);

    if (!assessment) {
      return res.status(404).json({
        error: "Assessment not found",
      });
    }

    res.json({ assessment });
  } catch (error) {
    next(error);
  }
});

// POST /api/assessments
// Start a new draft.
assessmentsRouter.post("/", async (req, res, next) => {
  try {
    const parsed = createSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid assessment data",
        details: parsed.error.flatten(),
      });
    }

    const vendor = await pool.query(
      "SELECT id FROM vendors WHERE id = $1",
      [parsed.data.vendorId]
    );

    if (vendor.rowCount === 0) {
      return res.status(404).json({
        error: "Vendor not found",
      });
    }

    const created = await pool.query<{ id: string }>(
      `INSERT INTO assessments (
         vendor_id,
         questionnaire_version,
         status
       )
       VALUES ($1, 1, 'draft')
       RETURNING id`,
      [parsed.data.vendorId]
    );

    const assessment = await findAssessment(created.rows[0].id);

    if (!assessment) {
      throw new Error("Created assessment could not be retrieved");
    }

    res.status(201).json({ assessment });
  } catch (error) {
    next(error);
  }
});

// PUT /api/assessments/:id/answers/:questionId
// Save or update one answer.
assessmentsRouter.put(
  "/:id/answers/:questionId",
  async (req, res, next) => {
    try {
      const parsedId = uuidSchema.safeParse(req.params.id);
      const parsedQuestionId = z.string().min(1).safeParse(
        req.params.questionId
      );
      const parsedBody = answerSchema.safeParse(req.body);

      if (!parsedId.success || !parsedQuestionId.success) {
        return res.status(400).json({
          error: "Invalid assessment or question ID",
        });
      }

      if (!parsedBody.success) {
        return res.status(400).json({
          error: "Invalid answer",
          details: parsedBody.error.flatten(),
        });
      }

      const question = assessmentQuestions.find(
        (item) => item.id === parsedQuestionId.data
      );

      if (!question) {
        return res.status(400).json({
          error: "Question does not belong to questionnaire version 1",
        });
      }

      const existing = await pool.query<{
        status: "draft" | "completed";
      }>(
        "SELECT status FROM assessments WHERE id = $1",
        [parsedId.data]
      );

      if (existing.rowCount === 0) {
        return res.status(404).json({
          error: "Assessment not found",
        });
      }

      if (existing.rows[0].status !== "draft") {
        return res.status(409).json({
          error: "Completed assessments cannot be changed",
        });
      }

      await pool.query(
        `INSERT INTO assessment_answers (
           assessment_id,
           question_id,
           category,
           answer,
           evidence_note
         )
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (assessment_id, question_id)
         DO UPDATE SET
           answer = EXCLUDED.answer,
           evidence_note = EXCLUDED.evidence_note`,
        [
          parsedId.data,
          question.id,
          question.category,
          parsedBody.data.answer,
          parsedBody.data.evidenceNote ?? null,
        ]
      );

      const assessment = await findAssessment(parsedId.data);

      res.json({ assessment });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/assessments/:id/complete
// Calculate the score on the server and complete the assessment.
assessmentsRouter.post(
  "/:id/complete",
  async (req, res, next) => {
    const parsedId = uuidSchema.safeParse(req.params.id);

    if (!parsedId.success) {
      return res.status(400).json({
        error: "Invalid assessment ID",
      });
    }

    const client = await pool.connect();
    let transactionStarted = false;

    try {
      await client.query("BEGIN");
      transactionStarted = true;

      // Lock the assessment while completing it.
      const existing = await client.query<{
        status: "draft" | "completed";
        questionnaire_version: number;
      }>(
        `SELECT status, questionnaire_version
         FROM assessments
         WHERE id = $1
         FOR UPDATE`,
        [parsedId.data]
      );

      if (existing.rowCount === 0) {
        await client.query("ROLLBACK");
        transactionStarted = false;

        return res.status(404).json({
          error: "Assessment not found",
        });
      }

      if (existing.rows[0].status !== "draft") {
        await client.query("ROLLBACK");
        transactionStarted = false;

        return res.status(409).json({
          error: "Assessment is already completed",
        });
      }

      if (existing.rows[0].questionnaire_version !== 1) {
        await client.query("ROLLBACK");
        transactionStarted = false;

        return res.status(400).json({
          error: "Unsupported questionnaire version",
        });
      }

      const answerRows = await client.query<{
        question_id: string;
        answer: QuestionResponse["answer"];
        evidence_note: string | null;
      }>(
        `SELECT question_id, answer, evidence_note
         FROM assessment_answers
         WHERE assessment_id = $1`,
        [parsedId.data]
      );

      const answers: Record<string, QuestionResponse> = {};

      for (const row of answerRows.rows) {
        answers[row.question_id] = {
          answer: row.answer,
          ...(row.evidence_note !== null
            ? { evidenceNote: row.evidence_note }
            : {}),
        };
      }

      let riskResult;

      try {
        riskResult = calculateAssessmentRisk(answers);
      } catch (error) {
        await client.query("ROLLBACK");
        transactionStarted = false;

        return res.status(400).json({
          error: error instanceof Error
            ? error.message
            : "Assessment answers are incomplete",
        });
      }

      await client.query(
        `UPDATE assessments
         SET
           status = 'completed',
           completed_at = NOW(),
           score = $1,
           risk_level = $2,
           category_scores = $3::jsonb,
           recommendations = $4::jsonb
         WHERE id = $5`,
        [
          riskResult.score,
          riskResult.level,
          JSON.stringify(riskResult.categoryScores),
          JSON.stringify(riskResult.recommendations),
          parsedId.data,
        ]
      );

      await client.query("COMMIT");
      transactionStarted = false;

      const assessment = await findAssessment(parsedId.data);

      if (!assessment) {
        throw new Error("Completed assessment could not be retrieved");
      }

      res.json({ assessment });
    } catch (error) {
      if (transactionStarted) {
        await client.query("ROLLBACK");
      }

      next(error);
    } finally {
      client.release();
    }
  }
);
