import type {
  DashboardVendor,
  RiskDistribution,
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