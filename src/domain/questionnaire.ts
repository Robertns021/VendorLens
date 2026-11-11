import type {
  AssessmentCategory,
  AssessmentQuestion,
} from "./models";

export const assessmentCategories: {
  id: AssessmentCategory;
  label: string;
  description: string;
}[] = [
  {
    id: "security",
    label: "Security",
    description: "Technical safeguards and access protection.",
  },
  {
    id: "privacy",
    label: "Privacy",
    description: "Personal data handling and privacy practices.",
  },
  {
    id: "compliance",
    label: "Compliance",
    description: "Independent assurance and documented policies.",
  },
  {
    id: "operational-resilience",
    label: "Operational resilience",
    description: "Business continuity and incident preparedness.",
  },
];

export const assessmentQuestions: AssessmentQuestion[] = [
  // SECURITY – 35 points
  {
    id: "sec-mfa",
    category: "security",
    title: "Does the vendor support and enforce Multi-Factor Authentication (MFA)?",
    explanation:
      "MFA adds an additional layer of protection to user and privileged accounts.",
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
    explanation:
      "Encryption helps protect stored information from unauthorised access.",
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
    explanation:
      "Users should only have access to information and systems necessary for their roles.",
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
    explanation:
      "Regular security testing can identify vulnerabilities before they are exploited.",
    weight: 7,
    recommendations: {
      no: "Request a regular independent security testing programme.",
      unknown: "Request recent penetration testing or security assessment evidence.",
    },
  },
  // PRIVACY – 25 points
  {
    id: "privacy-dpa",
    category: "privacy",
    title: "Is a Data Processing Agreement (DPA) in place where required?",
    explanation:
      "A DPA documents the responsibilities of parties when personal data is processed.",
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
    explanation:
      "Personal and confidential information should not be retained longer than necessary.",
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
    explanation:
      "Understanding where data is processed and which third parties are involved helps assess privacy risks.",
    weight: 7,
    recommendations: {
      no: "Request a list of processing locations and subprocessors.",
      unknown: "Request current information about processing locations and subprocessors.",
    },
  },
  // COMPLIANCE – 15 points
  {
    id: "compliance-assurance",
    category: "compliance",
    title: "Does the vendor provide current independent security assurance?",
    explanation:
      "Examples include an applicable ISO 27001 certification or SOC 2 report.",
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
    explanation:
      "Documented policies establish expectations for managing information security.",
    weight: 7,
    recommendations: {
      no: "Request documented information security policies and supporting procedures.",
      unknown: "Request evidence of the vendor's current security policies.",
    },
  },
  // OPERATIONAL RESILIENCE – 25 points
  {
    id: "operations-backups",
    category: "operational-resilience",
    title: "Are backups performed and tested regularly?",
    explanation:
      "Reliable backups help restore information after accidental loss or disruption.",
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
    explanation:
      "Disaster recovery planning helps restore critical services following major incidents.",
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
    explanation:
      "An incident response plan defines how security incidents are identified, managed and communicated.",
    weight: 7,
    recommendations: {
      no: "Require a documented incident response process with defined responsibilities.",
      unknown: "Request the incident response policy and communication procedures.",
    },
  },
];
