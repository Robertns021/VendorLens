import type {
  DashboardVendor,
  RiskDistribution,
  Vendor,
} from "../domain/models";

export const riskDistribution: RiskDistribution = {
  low: 12,
  medium: 8,
  high: 4,
};

export const recentVendors: DashboardVendor[] = [
  {
    id: "VEN-001",
    name: "Northstar Cloud",
    category: "Cloud Storage",
    score: 18,
    riskLevel: "low",
    lastAssessment: "Nov 4, 2026",
  },
  {
    id: "VEN-002",
    name: "SecureFlow",
    category: "Identity Management",
    score: 47,
    riskLevel: "medium",
    lastAssessment: "Nov 3, 2026",
  },
  {
    id: "VEN-003",
    name: "DataBridge",
    category: "Data Analytics",
    score: 72,
    riskLevel: "high",
    lastAssessment: "Nov 2, 2026",
  },
  {
    id: "VEN-004",
    name: "BrightDesk",
    category: "Customer Support",
    score: 34,
    riskLevel: "medium",
    lastAssessment: "Oct 30, 2026",
  },
];

export const demoVendors: Vendor[] = [
  {
    id: "VEN-001",
    name: "Northstar Cloud",
    website: "https://northstar.example",
    category: "Cloud Storage",
    description: "Cloud-based document storage and collaboration.",
    dataClassification: "confidential",
    status: "active",
    createdAt: "2026-10-20T10:00:00.000Z",
    updatedAt: "2026-11-04T10:00:00.000Z",
    latestAssessment: {
      score: 18,
      riskLevel: "low",
      assessedAt: "2026-11-04T10:00:00.000Z",
    },
  },
  {
    id: "VEN-002",
    name: "SecureFlow",
    website: "https://secureflow.example",
    category: "Identity Management",
    description: "Identity and access management platform.",
    dataClassification: "internal",
    status: "active",
    createdAt: "2026-10-21T10:00:00.000Z",
    updatedAt: "2026-11-03T10:00:00.000Z",
    latestAssessment: {
      score: 47,
      riskLevel: "medium",
      assessedAt: "2026-11-03T10:00:00.000Z",
    },
  },
  {
    id: "VEN-003",
    name: "DataBridge",
    website: "https://databridge.example",
    category: "Data Analytics",
    description: "Analytics and business intelligence service.",
    dataClassification: "confidential",
    status: "active",
    createdAt: "2026-10-22T10:00:00.000Z",
    updatedAt: "2026-11-02T10:00:00.000Z",
    latestAssessment: {
      score: 72,
      riskLevel: "high",
      assessedAt: "2026-11-02T10:00:00.000Z",
    },
  },
  {
    id: "VEN-004",
    name: "BrightDesk",
    website: "https://brightdesk.example",
    category: "Customer Support",
    description: "Customer support and ticket management software.",
    dataClassification: "internal",
    status: "active",
    createdAt: "2026-10-23T10:00:00.000Z",
    updatedAt: "2026-10-30T10:00:00.000Z",
    latestAssessment: {
      score: 34,
      riskLevel: "medium",
      assessedAt: "2026-10-30T10:00:00.000Z",
    },
  },
];