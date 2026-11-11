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

export type AssessmentAnswerValue = "yes" | "no" | "unknown";

export type AssessmentStatus = "draft" | "completed";

export type AssessmentCategory =
  | "security"
  | "privacy"
  | "compliance"
  | "operational-resilience";

export interface AssessmentQuestion {
  id: string;
  category: AssessmentCategory;
  title: string;
  explanation: string;
  weight: number;
  recommendations: {
    no: string;
    unknown: string;
  };
}

export interface QuestionResponse {
  answer: AssessmentAnswerValue;
  evidenceNote?: string;
}

export interface RiskRecommendation {
  questionId: string;
  category: AssessmentCategory;
  answer: "no" | "unknown";
  title: string;
  action: string;
}

export interface RiskResult {
  score: number;
  level: RiskLevel;
  categoryScores: Record<AssessmentCategory, number>;
  recommendations: RiskRecommendation[];
}

export interface Assessment {
  id: string;
  vendorId: string;
  questionnaireVersion: number;
  status: AssessmentStatus;
  answers: Record<string, QuestionResponse>;
  createdAt: string;
  completedAt?: string;
  result?: RiskResult;
}
