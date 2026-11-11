import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  ShieldAlert,
} from "lucide-react";

import type {
  Assessment,
  AssessmentAnswerValue,
  QuestionResponse,
  Vendor,
} from "../../domain/models";

import {
  assessmentCategories,
  assessmentQuestions,
} from "../../domain/questionnaire";

interface AssessmentWizardProps {
  vendor: Vendor;
  assessment: Assessment;
  onAnswerChange: (
    questionId: string,
    response: QuestionResponse
  ) => void;
  onComplete: () => void;
  onCancel: () => void;
}

const answerOptions: {
  value: AssessmentAnswerValue;
  label: string;
  description: string;
  styles: string;
  selectedStyles: string;
}[] = [
  {
    value: "yes",
    label: "Yes",
    description: "Implemented and supported by evidence",
    styles: "border-slate-200 text-slate-600",
    selectedStyles: "border-emerald-500 bg-emerald-50 text-emerald-800",
  },
  {
    value: "no",
    label: "No",
    description: "Control is not implemented",
    styles: "border-slate-200 text-slate-600",
    selectedStyles: "border-red-500 bg-red-50 text-red-800",
  },
  {
    value: "unknown",
    label: "Unknown",
    description: "Insufficient information available",
    styles: "border-slate-200 text-slate-600",
    selectedStyles: "border-amber-500 bg-amber-50 text-amber-800",
  },
];

function AssessmentWizard({
  vendor,
  assessment,
  onAnswerChange,
  onComplete,
  onCancel,
}: AssessmentWizardProps) {
  const [currentCategoryIndex, setCurrentCategoryIndex] =
    useState(0);

  const answeredCount = assessmentQuestions.filter(
    (question) => Boolean(assessment.answers[question.id]?.answer)
  ).length;

  const progress = Math.round(
    (answeredCount / assessmentQuestions.length) * 100
  );

  const currentCategory =
    assessmentCategories[currentCategoryIndex];

  const currentQuestions = assessmentQuestions.filter(
    (question) => question.category === currentCategory.id
  );

  const currentCategoryComplete = currentQuestions.every(
    (question) => Boolean(assessment.answers[question.id]?.answer)
  );

  const isLastCategory =
    currentCategoryIndex === assessmentCategories.length - 1;

  const result = assessment.result;

  // Display the completed assessment report.
  if (assessment.status === "completed" && result) {
    const scoreStyles = {
      low: "bg-emerald-50 text-emerald-700",
      medium: "bg-amber-50 text-amber-700",
      high: "bg-red-50 text-red-700",
    };

    return (
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm text-blue-600 font-medium">
              Assessment completed
            </p>

            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              {vendor.name}
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Vendor security assessment report
            </p>
          </div>

          <button
            onClick={onCancel}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Back to vendors
          </button>
        </div>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex h-36 w-36 shrink-0 flex-col items-center justify-center rounded-full border-8 border-slate-100">
              <span className="text-4xl font-bold text-slate-900">
                {result.score}
              </span>

              <span className="text-xs text-slate-500">
                Risk score / 100
              </span>
            </div>

            <div>
              <span
                className={`rounded-full px-3 py-1.5 text-sm font-semibold capitalize ${scoreStyles[result.level]}`}
              >
                {result.level} risk
              </span>

              <h2 className="mt-4 text-xl font-semibold text-slate-900">
                Assessment results
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                The score represents identified risk and
                insufficiently verified controls based on
                the VendorLens demonstration methodology.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900">
            Category breakdown
          </h2>

          <div className="mt-5 space-y-5">
            {assessmentCategories.map((category) => {
              const score = result.categoryScores[category.id];

              return (
                <div key={category.id}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-medium text-slate-700">
                      {category.label}
                    </span>

                    <span className="font-semibold text-slate-900">
                      {score}%
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-blue-600"
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2">
            <ShieldAlert size={19} className="text-amber-500" />

            <h2 className="font-semibold text-slate-900">
              Recommended actions
            </h2>
          </div>

          {result.recommendations.length > 0 ? (
            <div className="mt-5 space-y-4">
              {result.recommendations.map((recommendation) => (
                <div
                  key={recommendation.questionId}
                  className="border-l-2 border-amber-400 pl-4"
                >
                  <p className="text-sm font-medium text-slate-800">
                    {recommendation.title}
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    {recommendation.action}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-emerald-700">
              No additional actions were identified by this assessment.
            </p>
          )}
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-blue-600">
            Security assessment
          </p>

          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            {vendor.name}
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Complete the questionnaire to evaluate this vendor.
          </p>
        </div>

        <button
          onClick={onCancel}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>

      {/* Progress */}
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex justify-between text-sm">
          <span className="font-semibold text-slate-800">
            Assessment progress
          </span>

          <span className="text-slate-500">
            {answeredCount}/{assessmentQuestions.length} questions
          </span>
        </div>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-blue-600 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {assessmentCategories.map((category, index) => (
            <button
              key={category.id}
              type="button"
              disabled={
                assessmentCategories
                  .slice(0, index)
                  .some((previous) =>
                    assessmentQuestions
                      .filter((question) => question.category === previous.id)
                      .some((question) => !assessment.answers[question.id]?.answer)
                  )
              }
              onClick={() => setCurrentCategoryIndex(index)}
              className={`rounded-lg border p-3 text-left text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${
                currentCategoryIndex === index
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-slate-200 text-slate-500 hover:bg-slate-50"
              }`}
            >
              <span className="block text-slate-400">
                SECTION {index + 1}
              </span>

              <span className="mt-1 block">
                {category.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Questions */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            Section {currentCategoryIndex + 1} of 4
          </p>

          <h2 className="mt-2 text-xl font-bold text-slate-900">
            {currentCategory.label}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {currentCategory.description}
          </p>
        </div>

        <div className="space-y-8">
          {currentQuestions.map((question, index) => {
            const response = assessment.answers[question.id];

            return (
              <div
                key={question.id}
                className="border-b border-slate-100 pb-7 last:border-0 last:pb-0"
              >
                <div className="flex justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-slate-400">
                      QUESTION {index + 1}
                    </p>

                    <h3 className="mt-2 font-semibold leading-6 text-slate-900">
                      {question.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {question.explanation}
                    </p>
                  </div>

                  <span className="shrink-0 text-xs font-medium text-slate-400">
                    Weight: {question.weight}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {answerOptions.map((option) => {
                    const selected =
                      response?.answer === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        aria-pressed={selected}
                        onClick={() =>
                          onAnswerChange(question.id, {
                            answer: option.value,
                            evidenceNote: response?.evidenceNote,
                          })
                        }
                        className={`rounded-lg border p-3 text-left transition ${
                          selected
                            ? option.selectedStyles
                            : `${option.styles} hover:bg-slate-50`
                        }`}
                      >
                        <span className="flex items-center justify-between font-semibold text-sm">
                          {option.label}

                          {selected && (
                            <CheckCircle2 size={17} />
                          )}
                        </span>

                        <span className="mt-1 block text-xs leading-5 opacity-80">
                          {option.description}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4">
                  <label
                    htmlFor={`evidence-${question.id}`}
                    className="text-xs font-medium text-slate-600"
                  >
                    Evidence / assessment notes (optional)
                  </label>

                  <textarea
                    id={`evidence-${question.id}`}
                    rows={2}
                    maxLength={500}
                    disabled={!response}
                    value={response?.evidenceNote ?? ""}
                    onChange={(event) =>
                      response &&
                      onAnswerChange(question.id, {
                        ...response,
                        evidenceNote: event.target.value,
                      })
                    }
                    placeholder={
                      response
                        ? "Add a document reference or explanation..."
                        : "Select an answer before adding notes."
                    }
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="mt-8 flex flex-col-reverse justify-between gap-3 border-t border-slate-100 pt-5 sm:flex-row">
          <button
            type="button"
            disabled={currentCategoryIndex === 0}
            onClick={() =>
              setCurrentCategoryIndex((current) => current - 1)
            }
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
          >
            <ArrowLeft size={16} />
            Previous section
          </button>

          {!isLastCategory ? (
            <button
              type="button"
              disabled={!currentCategoryComplete}
              onClick={() =>
                setCurrentCategoryIndex((current) => current + 1)
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continue
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              disabled={answeredCount !== assessmentQuestions.length}
              onClick={onComplete}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ClipboardCheck size={17} />
              Complete assessment
            </button>
          )}
        </div>
      </section>

      <p className="text-center text-xs text-slate-400">
        Your answers are saved automatically. All assessment data
        is stored locally in this browser.
      </p>
    </div>
  );
}

export default AssessmentWizard;
