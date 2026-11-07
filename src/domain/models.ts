export type RiskLevel = "low" | "medium" | "high";

export type DataClassification =
  | "public"
  | "internal"
  | "confidential";

export type VendorStatus = "active" | "archived";

export type NavSection =
  | "Dashboard"
  | "Vendors"
  | "Assessments"
  | "Reports";

export interface AssessmentSummary {
  score: number;
  riskLevel: RiskLevel;
  assessedAt: string;
}

export interface Vendor {
  id: string;
  name: string;
  website?: string;
  category: string;
  description: string;
  dataClassification: DataClassification;
  status: VendorStatus;
  createdAt: string;
  updatedAt: string;
  latestAssessment?: AssessmentSummary;
}

export type VendorInput = Pick<
  Vendor,
  | "name"
  | "website"
  | "category"
  | "description"
  | "dataClassification"
>;

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