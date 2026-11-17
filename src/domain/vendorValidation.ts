import type { VendorInput } from "./models";

export type VendorValidationErrors = Partial<
  Record<keyof VendorInput, string>
>;

export function validateVendorInput(
  input: VendorInput
): VendorValidationErrors {
  const errors: VendorValidationErrors = {};

  const name = input.name.trim();
  const category = input.category.trim();
  const website = input.website?.trim() ?? "";

  if (!name) {
    errors.name = "Vendor name is required.";
  } else if (name.length > 100) {
    errors.name = "Vendor name cannot exceed 100 characters.";
  }

  if (!category) {
    errors.category = "Service category is required.";
  } else if (category.length > 80) {
    errors.category = "Category cannot exceed 80 characters.";
  }

  if (input.description.length > 500) {
    errors.description = "Description cannot exceed 500 characters.";
  }

  if (website) {
    try {
      const parsedUrl = new URL(website);

      if (
        parsedUrl.protocol !== "https:" &&
        parsedUrl.protocol !== "http:"
      ) {
        errors.website = "Website must use HTTP or HTTPS.";
      }
    } catch {
      errors.website = "Please enter a valid website address.";
    }
  }

  return errors;
}
