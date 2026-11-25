import { Router } from "express";
import { z } from "zod";
import { pool } from "../db.js";

export const vendorsRouter = Router();

// Validate incoming vendor data.
const vendorSchema = z.object({
  name: z.string().trim().min(1).max(150),
  website: z.union([
    z.string().trim().url(),
    z.literal(""),
  ]).optional(),
  category: z.string().trim().min(1).max(100),
  description: z.string().trim().max(5000).default(""),
  dataClassification: z.enum([
    "public",
    "internal",
    "confidential",
  ]),
});

const idSchema = z.string().uuid();

type VendorRow = {
  id: string;
  name: string;
  website: string | null;
  category: string;
  description: string;
  data_classification: "public" | "internal" | "confidential";
  status: "active" | "archived";
  created_at: Date;
  updated_at: Date;
  latest_assessment_score: string | null;
  latest_assessment_risk_level: "low" | "medium" | "high" | null;
  latest_assessment_at: Date | null;
};

// Shared SQL query: also retrieves the latest completed assessment.
const vendorSelect = `
  SELECT
    v.id,
    v.name,
    v.website,
    v.category,
    v.description,
    v.data_classification,
    v.status,
    v.created_at,
    v.updated_at,
    a.score AS latest_assessment_score,
    a.risk_level AS latest_assessment_risk_level,
    a.completed_at AS latest_assessment_at
  FROM vendors v
  LEFT JOIN LATERAL (
    SELECT score, risk_level, completed_at
    FROM assessments
    WHERE vendor_id = v.id
      AND status = 'completed'
    ORDER BY completed_at DESC
    LIMIT 1
  ) a ON TRUE
`;

// Convert PostgreSQL column names to the frontend's camelCase format.
function mapVendor(row: VendorRow) {
  return {
    id: row.id,
    name: row.name,
    website: row.website ?? undefined,
    category: row.category,
    description: row.description,
    dataClassification: row.data_classification,
    status: row.status,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
    ...(row.latest_assessment_score !== null &&
    row.latest_assessment_at !== null &&
    row.latest_assessment_risk_level !== null
      ? {
          latestAssessment: {
            score: Number(row.latest_assessment_score),
            riskLevel: row.latest_assessment_risk_level,
            assessedAt: row.latest_assessment_at.toISOString(),
          },
        }
      : {}),
  };
}

// Retrieve one vendor, including its latest assessment.
async function findVendorById(id: string) {
  const result = await pool.query<VendorRow>(
    `${vendorSelect} WHERE v.id = $1`,
    [id]
  );

  return result.rows[0] ?? null;
}

// GET /api/vendors
vendorsRouter.get("/", async (_req, res, next) => {
  try {
    const result = await pool.query<VendorRow>(
      `${vendorSelect} ORDER BY v.created_at DESC`
    );

    res.json({
      vendors: result.rows.map(mapVendor),
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/vendors/:id
vendorsRouter.get("/:id", async (req, res, next) => {
  try {
    const parsedId = idSchema.safeParse(req.params.id);

    if (!parsedId.success) {
      return res.status(400).json({
        error: "Invalid vendor ID",
      });
    }

    const vendor = await findVendorById(parsedId.data);

    if (!vendor) {
      return res.status(404).json({
        error: "Vendor not found",
      });
    }

    res.json({
      vendor: mapVendor(vendor),
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/vendors
vendorsRouter.post("/", async (req, res, next) => {
  try {
    const parsed = vendorSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid vendor data",
        details: parsed.error.flatten(),
      });
    }

    const {
      name,
      website,
      category,
      description,
      dataClassification,
    } = parsed.data;

    const result = await pool.query<{ id: string }>(
      `INSERT INTO vendors (
        name,
        website,
        category,
        description,
        data_classification
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id`,
      [
        name,
        website || null,
        category,
        description,
        dataClassification,
      ]
    );

    const vendor = await findVendorById(result.rows[0].id);

    if (!vendor) {
      throw new Error("Created vendor could not be retrieved");
    }

    res.status(201).json({
      vendor: mapVendor(vendor),
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/vendors/:id
vendorsRouter.put("/:id", async (req, res, next) => {
  try {
    const parsedId = idSchema.safeParse(req.params.id);
    const parsedBody = vendorSchema.safeParse(req.body);

    if (!parsedId.success) {
      return res.status(400).json({
        error: "Invalid vendor ID",
      });
    }

    if (!parsedBody.success) {
      return res.status(400).json({
        error: "Invalid vendor data",
        details: parsedBody.error.flatten(),
      });
    }

    const {
      name,
      website,
      category,
      description,
      dataClassification,
    } = parsedBody.data;

    const result = await pool.query(
      `UPDATE vendors
       SET
         name = $1,
         website = $2,
         category = $3,
         description = $4,
         data_classification = $5
       WHERE id = $6
       RETURNING id`,
      [
        name,
        website || null,
        category,
        description,
        dataClassification,
        parsedId.data,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: "Vendor not found",
      });
    }

    const vendor = await findVendorById(parsedId.data);

    res.json({
      vendor: vendor ? mapVendor(vendor) : null,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/vendors/:id
// Soft-delete: archive the vendor and preserve assessment history.
vendorsRouter.delete("/:id", async (req, res, next) => {
  try {
    const parsedId = idSchema.safeParse(req.params.id);

    if (!parsedId.success) {
      return res.status(400).json({
        error: "Invalid vendor ID",
      });
    }

    const result = await pool.query(
      `UPDATE vendors
       SET status = 'archived'
       WHERE id = $1
       RETURNING id`,
      [parsedId.data]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: "Vendor not found",
      });
    }

    const vendor = await findVendorById(parsedId.data);

    res.json({
      vendor: vendor ? mapVendor(vendor) : null,
      message: "Vendor archived successfully",
    });
  } catch (error) {
    next(error);
  }
});
