import {
  ArrowRight,
  ClipboardCheck,
  Clock,
  FileCheck,
} from "lucide-react";

import type { Assessment, Vendor } from "../../domain/models";

interface AssessmentManagementProps {
  assessments: Assessment[];
  vendors: Vendor[];
  onOpen: (assessmentId: string) => void;
}

function AssessmentManagement({
  assessments,
  vendors,
  onOpen,
}: AssessmentManagementProps) {
  const sortedAssessments = [...assessments].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime()
  );

  function formatDate(value: string) {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(value));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Assessments
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage ongoing and completed vendor assessments.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">
            Draft assessments
          </p>

          <p className="mt-2 text-2xl font-bold text-amber-600">
            {assessments.filter((a) => a.status === "draft").length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">
            Completed assessments
          </p>

          <p className="mt-2 text-2xl font-bold text-emerald-600">
            {assessments.filter((a) => a.status === "completed").length}
          </p>
        </div>
      </div>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <h2 className="font-semibold text-slate-900">
            Assessment history
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Select an assessment to resume or review its results.
          </p>
        </div>

        {sortedAssessments.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {sortedAssessments.map((assessment) => {
              const vendor = vendors.find(
                (item) => item.id === assessment.vendorId
              );

              const completed =
                assessment.status === "completed";

              const risk = assessment.result?.level;

              return (
                <div
                  key={assessment.id}
                  className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center"
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600">
                      {completed ? (
                        <FileCheck size={20} />
                      ) : (
                        <Clock size={20} />
                      )}
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {vendor?.name ?? "Unknown vendor"}
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        {completed
                          ? `Completed ${formatDate(
                              assessment.completedAt ?? assessment.createdAt
                            )}`
                          : `Started ${formatDate(assessment.createdAt)}`}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            completed
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {completed ? "Completed" : "Draft"}
                        </span>

                        {risk && (
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize text-slate-600">
                            {risk} risk
                          </span>
                        )}

                        <span className="text-xs text-slate-400">
                          Questionnaire v{assessment.questionnaireVersion}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onOpen(assessment.id)}
                    disabled={!vendor}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-blue-300 hover:text-blue-600 disabled:opacity-40"
                  >
                    {completed ? "Review report" : "Resume assessment"}
                    <ArrowRight size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center">
            <ClipboardCheck
              size={34}
              className="mx-auto text-slate-300"
            />

            <h3 className="mt-3 font-semibold text-slate-800">
              No assessments yet
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Start an assessment from the Vendors section.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

export default AssessmentManagement;