import type { Assessment, Vendor } from "../../domain/models";

// Escape values and protect against spreadsheet formula injection.
function escapeCsvValue(value: string | number): string {
  let text = String(value);

  if (/^[\s]*[=+\-@]/.test(text)) {
    text = `'${text}`;
  }

  return `"${text.replace(/"/g, '""')}"`;
}

export function exportAssessmentsCsv(
  assessments: Assessment[],
  vendors: Vendor[]
): void {
  if (assessments.length === 0) {
    return;
  }

  const vendorMap = new Map(
    vendors.map((vendor) => [vendor.id, vendor.name])
  );

  const headers = [
    "Assessment ID",
    "Vendor",
    "Status",
    "Created Date",
    "Completed Date",
    "Risk Score",
    "Risk Level",
    "Security Score",
    "Privacy Score",
    "Compliance Score",
    "Operational Resilience Score",
    "Questionnaire Version",
  ];

  const rows = assessments.map((assessment) => {
    const result = assessment.result;

    return [
      assessment.id,
      vendorMap.get(assessment.vendorId) ?? "Unknown vendor",
      assessment.status,
      assessment.createdAt,
      assessment.completedAt ?? "",
      result?.score ?? "",
      result?.level ?? "",
      result?.categoryScores.security ?? "",
      result?.categoryScores.privacy ?? "",
      result?.categoryScores.compliance ?? "",
      result?.categoryScores["operational-resilience"] ?? "",
      assessment.questionnaireVersion,
    ];
  });

  const csvContent = [
    headers,
    ...rows,
  ]
    .map((row) => row.map(escapeCsvValue).join(","))
    .join("\r\n");

  // UTF-8 BOM improves compatibility with Excel.
  const blob = new Blob(
    ["\uFEFF", csvContent],
    { type: "text/csv;charset=utf-8;" }
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `vendorlens-assessments-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
