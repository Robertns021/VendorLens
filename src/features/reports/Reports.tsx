import { useMemo } from "react";
import {
  Activity,
  ArrowRight,
  ClipboardList,
  Download,
  FileText,
  ShieldAlert,
} from "lucide-react";

import type {
  Assessment,
  RiskLevel,
  Vendor,
} from "../../domain/models";

import { assessmentCategories } from "../../domain/questionnaire";
import { exportAssessmentsCsv } from "./exportAssessmentsCsv";

interface ReportsProps {
  assessments: Assessment[];
  vendors: Vendor[];
  onOpenAssessment: (assessmentId: string) => void;
}

const riskStyles: Record<RiskLevel, string> = {
  low: "bg-emerald-50 text-emerald-700",
  medium: "bg-amber-50 text-amber-700",
  high: "bg-red-50 text-red-700",
};

const riskColors: Record<RiskLevel, string> = {
  low: "bg-emerald-500",
  medium: "bg-amber-500",
  high: "bg-red-500",
};

function Reports({
  assessments,
  vendors,
  onOpenAssessment,
}: ReportsProps) {
  const vendorMap = useMemo(
    () => new Map(vendors.map((vendor) => [vendor.id, vendor.name])),
    [vendors]
  );

  const completedAssessments = useMemo(
    () =>
      assessments.filter(
        (assessment) =>
          assessment.status === "completed" &&
          assessment.result !== undefined
      ),
    [assessments]
  );

  const draftCount = assessments.filter(
    (assessment) => assessment.status === "draft"
  ).length;

  const averageRisk = completedAssessments.length
    ? completedAssessments.reduce(
        (total, assessment) =>
          total + (assessment.result?.score ?? 0),
        0
      ) / completedAssessments.length
    : null;

  const riskCounts = useMemo(() => {
    return completedAssessments.reduce(
      (counts, assessment) => {
        const level = assessment.result?.level;

        if (level) {
          counts[level]++;
        }

        return counts;
      },
      { low: 0, medium: 0, high: 0 }
    );
  }, [completedAssessments]);

  const categoryAverages = useMemo(() => {
    return assessmentCategories.map((category) => {
      const scores = completedAssessments
        .map(
          (assessment) =>
            assessment.result?.categoryScores[category.id]
        )
        .filter((score): score is number => score !== undefined);

      const average = scores.length
        ? scores.reduce((total, score) => total + score, 0) /
          scores.length
        : null;

      return {
        ...category,
        average,
      };
    });
  }, [completedAssessments]);

  const sortedAssessments = useMemo(
    () =>
      [...assessments].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      ),
    [assessments]
  );

  const totalCompleted = completedAssessments.length;

  function formatDate(value: string) {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(value));
  }

  function getCategoryColor(score: number) {
    if (score < 30) return "bg-emerald-500";
    if (score < 60) return "bg-amber-500";
    return "bg-red-500";
  }

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Reports & Analytics
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Analyse vendor assessments and monitor identified risks.
          </p>
        </div>

        <button
          type="button"
          disabled={assessments.length === 0}
          onClick={() =>
            exportAssessmentsCsv(assessments, vendors)
          }
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Download size={17} />
          Export CSV
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Total assessments
            </p>
            <ClipboardList size={20} className="text-blue-600" />
          </div>

          <p className="mt-4 text-3xl font-bold text-slate-900">
            {assessments.length}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            All assessment records
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Completed assessments
            </p>
            <FileText size={20} className="text-emerald-600" />
          </div>

          <p className="mt-4 text-3xl font-bold text-slate-900">
            {totalCompleted}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Finalised evaluations
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Draft assessments
            </p>
            <Activity size={20} className="text-amber-600" />
          </div>

          <p className="mt-4 text-3xl font-bold text-slate-900">
            {draftCount}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Awaiting completion
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Average risk score
            </p>
            <ShieldAlert size={20} className="text-red-500" />
          </div>

          <p className="mt-4 text-3xl font-bold text-slate-900">
            {averageRisk === null
              ? "—"
              : `${averageRisk.toFixed(1)}/100`}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Across completed assessments
          </p>
        </div>
      </div>

      {/* Analytics */}
      {totalCompleted > 0 ? (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {/* Risk distribution */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-slate-900">
              Risk distribution
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Distribution of completed assessments
            </p>

            <div className="mt-7 space-y-6">
              {(
                ["low", "medium", "high"] as RiskLevel[]
              ).map((level) => {
                const count = riskCounts[level];
                const percentage =
                  (count / totalCompleted) * 100;

                return (
                  <div key={level}>
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="font-medium capitalize text-slate-700">
                        {level} risk
                      </span>

                      <span className="text-slate-500">
                        {count} ({percentage.toFixed(0)}%)
                      </span>
                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full transition-all ${riskColors[level]}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 rounded-lg bg-slate-50 p-4">
              <p className="text-sm text-slate-600">
                Completed assessments:{" "}
                <strong className="text-slate-900">
                  {totalCompleted}
                </strong>
              </p>
            </div>
          </section>

          {/* Category analysis */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-slate-900">
              Category risk analysis
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Average risk score by assessment category
            </p>

            <div className="mt-7 space-y-7">
              {categoryAverages.map((category) => {
                const score = category.average;

                return (
                  <div key={category.id}>
                    <div className="mb-2 flex justify-between gap-3 text-sm">
                      <span className="font-medium text-slate-700">
                        {category.label}
                      </span>

                      <span className="font-semibold text-slate-900">
                        {score === null
                          ? "No data"
                          : `${score.toFixed(1)}%`}
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      {score !== null && (
                        <div
                          className={`h-full rounded-full transition-all ${getCategoryColor(score)}`}
                          style={{ width: `${score}%` }}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      ) : (
        <section className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <FileText
            size={36}
            className="mx-auto text-slate-300"
          />

          <h2 className="mt-3 font-semibold text-slate-900">
            No completed assessments yet
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Complete a vendor assessment to populate your analytics.
          </p>
        </section>
      )}

      {/* Assessment history */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <h2 className="font-semibold text-slate-900">
            Assessment history
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Review ongoing and completed vendor assessments.
          </p>
        </div>

        {sortedAssessments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-medium">Vendor</th>
                  <th className="px-5 py-4 font-medium">Date</th>
                  <th className="px-5 py-4 font-medium">Score</th>
                  <th className="px-5 py-4 font-medium">Risk level</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 text-right font-medium">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {sortedAssessments.map((assessment) => {
                  const result = assessment.result;
                  const completed =
                    assessment.status === "completed";

                  return (
                    <tr
                      key={assessment.id}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-5 py-4 font-semibold text-slate-900">
                        {vendorMap.get(assessment.vendorId) ??
                          "Unknown vendor"}
                      </td>

                      <td className="px-5 py-4 text-slate-500">
                        {formatDate(
                          assessment.completedAt ??
                            assessment.createdAt
                        )}
                      </td>

                      <td className="px-5 py-4 font-semibold text-slate-800">
                        {result ? `${result.score}/100` : "—"}
                      </td>

                      <td className="px-5 py-4">
                        {result ? (
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${riskStyles[result.level]}`}
                          >
                            {result.level}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">
                            Pending
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            completed
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {completed ? "Completed" : "Draft"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            onOpenAssessment(assessment.id)
                          }
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
                        >
                          {completed ? "View report" : "Resume"}
                          <ArrowRight size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center text-sm text-slate-500">
            Assessment history will appear here.
          </div>
        )}
      </section>

      <p className="text-center text-xs text-slate-400">
        Analytics are calculated from locally stored assessment records.
        Risk scores use the VendorLens demonstration methodology.
      </p>
    </div>
  );
}

export default Reports;
