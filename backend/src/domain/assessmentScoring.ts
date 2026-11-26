export type AssessmentCategory =
  | "security"
  | "privacy"
  | "compliance"
  | "operational-resilience";

export type AnswerValue = "yes" | "no" | "unknown";
export type RiskLevel = "low" | "medium" | "high";

export interface QuestionResponse {
  answer: AnswerValue;
  evidenceNote?: string;
}

interface QuestionDefinition {
  id: string;
  category: AssessmentCategory;
  title: string;
  weight: number;
  recommendations: {
    no: string;
    unknown: string;
  };
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

export const assessmentQuestions: QuestionDefinition[] = [
  {
    id: "sec-mfa",
    category: "security",
    title: "Does the vendor support and enforce Multi-Factor Authentication (MFA)?",
    weight: 10,
    recommendations: {
      no: "Require MFA for all vendor accounts, especially privileged accounts.",
      unknown: "Request evidence confirming MFA availability and enforcement.",
    },
  },
  {
    id: "sec-encryption",
    category: "security",
    title: "Is sensitive information encrypted at rest?",
    weight: 10,
    recommendations: {
      no: "Require encryption of sensitive information at rest.",
      unknown: "Request documentation describing the vendor's storage encryption controls.",
    },
  },
  {
    id: "sec-access-control",
    category: "security",
    title: "Does the vendor enforce least-privilege access controls?",
    weight: 8,
    recommendations: {
      no: "Require role-based access controls and periodic permission reviews.",
      unknown: "Request details of access control and permission review procedures.",
    },
  },
  {
    id: "sec-testing",
    category: "security",
    title: "Does the vendor perform regular independent security testing?",
    weight: 7,
    recommendations: {
      no: "Request a regular independent security testing programme.",
      unknown: "Request recent penetration testing or security assessment evidence.",
    },
  },
  {
    id: "privacy-dpa",
    category: "privacy",
    title: "Is a Data Processing Agreement (DPA) in place where required?",
    weight: 10,
    recommendations: {
      no: "Review the processing relationship and establish an appropriate DPA where required.",
      unknown: "Request confirmation of the applicable data processing terms.",
    },
  },
  {
    id: "privacy-retention",
    category: "privacy",
    title: "Are data retention and deletion procedures documented?",
    weight: 8,
    recommendations: {
      no: "Establish documented retention periods and secure deletion procedures.",
      unknown: "Request the vendor's data retention and deletion policy.",
    },
  },
  {
    id: "privacy-subprocessors",
    category: "privacy",
    title: "Does the vendor disclose its data processing locations and subprocessors?",
    weight: 7,
    recommendations: {
      no: "Request a list of processing locations and subprocessors.",
      unknown: "Request current information about processing locations and subprocessors.",
    },
  },
  {
    id: "compliance-assurance",
    category: "compliance",
    title: "Does the vendor provide current independent security assurance?",
    weight: 8,
    recommendations: {
      no: "Evaluate the absence of independent assurance and request an appropriate alternative.",
      unknown: "Request current certification or independent assurance documentation.",
    },
  },
  {
    id: "compliance-policies",
    category: "compliance",
    title: "Does the vendor maintain documented security policies?",
    weight: 7,
    recommendations: {
      no: "Request documented information security policies and supporting procedures.",
      unknown: "Request evidence of the vendor's current security policies.",
    },
  },
  {
    id: "operations-backups",
    category: "operational-resilience",
    title: "Are backups performed and tested regularly?",
    weight: 10,
    recommendations: {
      no: "Require documented backup procedures and regular restoration testing.",
      unknown: "Request backup schedules and evidence of successful restoration tests.",
    },
  },
  {
    id: "operations-disaster-recovery",
    category: "operational-resilience",
    title: "Does the vendor maintain and test a disaster recovery plan?",
    weight: 8,
    recommendations: {
      no: "Request a documented disaster recovery plan with regular testing.",
      unknown: "Request the current disaster recovery plan and evidence of testing.",
    },
  },
  {
    id: "operations-incident-response",
    category: "operational-resilience",
    title: "Does the vendor maintain a documented incident response plan?",
    weight: 7,
    recommendations: {
      no: "Require a documented incident response process with defined responsibilities.",
      unknown: "Request the incident response policy and communication procedures.",
    },
  },
];

const categories: AssessmentCategory[] = [
  "security",
  "privacy",
  "compliance",
  "operational-resilience",
];

function roundScore(value: number): number {
  return Math.round(value * 10) / 10;
}

function getRiskLevel(score: number): RiskLevel {
  if (score < 30) return "low";
  if (score < 60) return "medium";
  return "high";
}

export function calculateAssessmentRisk(
  answers: Record<string, QuestionResponse>
): RiskResult {
  const validIds = new Set(
    assessmentQuestions.map((question) => question.id)
  );

  const unknownIds = Object.keys(answers).filter(
    (id) => !validIds.has(id)
  );

  if (unknownIds.length > 0) {
    throw new Error(
      `Unknown question IDs: ${unknownIds.join(", ")}`
    );
  }

  const incomplete = assessmentQuestions.filter((question) => {
    const answer = answers[question.id]?.answer;

    return (
      answer !== "yes" &&
      answer !== "no" &&
      answer !== "unknown"
    );
  });

  if (incomplete.length > 0) {
    throw new Error(
      `Missing or invalid responses for: ${
        incomplete.map((question) => question.id).join(", ")
      }`
    );
  }

  let totalRiskPoints = 0;

  const categoryRiskPoints: Record<AssessmentCategory, number> = {
    security: 0,
    privacy: 0,
    compliance: 0,
    "operational-resilience": 0,
  };

  const categoryWeights: Record<AssessmentCategory, number> = {
    security: 0,
    privacy: 0,
    compliance: 0,
    "operational-resilience": 0,
  };

  const recommendations: RiskRecommendation[] = [];

  for (const question of assessmentQuestions) {
    const answer = answers[question.id].answer;

    const multiplier =
      answer === "no" ? 1 :
      answer === "unknown" ? 0.5 : 0;

    const riskPoints = question.weight * multiplier;

    totalRiskPoints += riskPoints;
    categoryRiskPoints[question.category] += riskPoints;
    categoryWeights[question.category] += question.weight;

    if (answer !== "yes") {
      recommendations.push({
        questionId: question.id,
        category: question.category,
        answer,
        title: question.title,
        action: question.recommendations[answer],
      });
    }
  }

  const categoryScores = {} as Record<
    AssessmentCategory,
    number
  >;

  for (const category of categories) {
    categoryScores[category] = roundScore(
      (categoryRiskPoints[category] /
        categoryWeights[category]) * 100
    );
  }

  const score = roundScore(totalRiskPoints);

  return {
    score,
    level: getRiskLevel(score),
    categoryScores,
    recommendations,
  };
}
