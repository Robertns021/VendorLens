export type RiskLevel = "low" | "medium" | "high";

export type NavSection =
  | "Dashboard"
  | "Vendors"
  | "Assessments"
  | "Reports";

export interface DashboardVendor {
  id: string;
  name: string;
  category: string;
  score: number;
  riskLevel: RiskLevel;
  lastAssessment: string;
}

export interface RiskDistribution {
  low: number;
  medium: number;
  high: number;
}