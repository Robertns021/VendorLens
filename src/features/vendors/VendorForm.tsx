import { validateVendorInput } from "../../domain/vendorValidation";
import type { VendorValidationErrors } from "../../domain/vendorValidation";
import Button from "../../components/ui/Button";
import { useState } from "react";
import type { FormEvent } from "react";

import type {
  DataClassification,
  Vendor,
  VendorInput,
} from "../../domain/models";

interface VendorFormProps {
  initialVendor?: Vendor;
  onSubmit: (input: VendorInput) => Promise<void>;
  onCancel: () => void;
}

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

function VendorForm({
  initialVendor,
  onSubmit,
  onCancel,
}: VendorFormProps) {
  const [name, setName] = useState(initialVendor?.name ?? "");
  const [website, setWebsite] = useState(initialVendor?.website ?? "");
  const [category, setCategory] = useState(
    initialVendor?.category ?? ""
  );
  const [description, setDescription] = useState(
    initialVendor?.description ?? ""
  );

  const [validationErrors, setValidationErrors] =
    useState<VendorValidationErrors>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [dataClassification, setDataClassification] =
    useState<DataClassification>(
      initialVendor?.dataClassification ?? "internal"
    );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) return;

    const vendorInput: VendorInput = {
      name: name.trim(),
      website: website.trim() || undefined,
      category: category.trim(),
      description: description.trim(),
      dataClassification,
    };

    const errors = validateVendorInput(vendorInput);
    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await onSubmit(vendorInput);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Could not save vendor. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900">
          {initialVendor ? "Edit vendor" : "Add new vendor"}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Enter the vendor's basic information.
        </p>
      </div>

      {submitError && (
        <p
          role="alert"
          className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
        >
          {submitError}
        </p>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          <label
            htmlFor="vendor-name"
            className="text-sm font-medium text-slate-700"
          >
            Vendor name *
          </label>

          <input
            id="vendor-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Northstar Cloud"
            maxLength={100}
            className={inputClass}
            aria-invalid={Boolean(validationErrors.name)}
            aria-describedby={
              validationErrors.name ? "vendor-name-error" : undefined
            }
          />
          {validationErrors.name && (
            <p
              id="vendor-name-error"
              role="alert"
              className="mt-1 text-xs text-red-600">
              {validationErrors.name}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="vendor-website"
            className="text-sm font-medium text-slate-700"
          >
            Website
          </label>

          <input
            id="vendor-website"
            type="text"
            inputMode="url"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
            placeholder="https://example.com"
            className={inputClass}
            aria-invalid={Boolean(validationErrors.website)}
            aria-describedby={
              validationErrors.website ? "vendor-website-error" : undefined
            }
          />
          {validationErrors.website && (
            <p
              id="vendor-website-error"
              role="alert"
              className="mt-1 text-xs text-red-600"
            >
              {validationErrors.website}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="vendor-category"
            className="text-sm font-medium text-slate-700"
          >
            Service category *
          </label>

          <input
            id="vendor-category"
            type="text"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            placeholder="e.g. Cloud Storage"
            maxLength={80}
            className={inputClass}
            aria-invalid={Boolean(validationErrors.category)}
            aria-describedby={
              validationErrors.category ? "vendor-category-error" : undefined
            }
          />
          {validationErrors.category && (
            <p
              id="vendor-category-error"
              role="alert"
              className="mt-1 text-xs text-red-600"
            >
              {validationErrors.category}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="vendor-classification"
            className="text-sm font-medium text-slate-700"
          >
            Data classification *
          </label>

          <select
            id="vendor-classification"
            value={dataClassification}
            onChange={(event) =>
              setDataClassification(
                event.target.value as DataClassification
              )
            }
            className={inputClass}
          >
            <option value="public">Public</option>
            <option value="internal">Internal</option>
            <option value="confidential">Confidential</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="vendor-description"
            className="text-sm font-medium text-slate-700"
          >
            Description
          </label>

          <textarea
            id="vendor-description"
            rows={3}
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            placeholder="Describe the services this vendor provides..."
            maxLength={500}
            className={inputClass}
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            if (!isSubmitting) onCancel();
          }}
        >
          Cancel
        </Button>

        <Button type="submit">
          {isSubmitting
            ? "Saving..."
            : initialVendor
              ? "Save changes"
              : "Add vendor"}
        </Button>
      </div>
    </form>
  );
}

export default VendorForm;
