import { describe, expect, it } from "vitest";

import { validateVendorInput } from "./vendorValidation";
import type { VendorInput } from "./models";

const validVendor: VendorInput = {
  name: "Northstar Cloud",
  website: "https://northstar.example",
  category: "Cloud Storage",
  description: "Cloud-based document storage.",
  dataClassification: "confidential",
};

describe("Vendor input validation", () => {
  it("accepts valid vendor information", () => {
    expect(validateVendorInput(validVendor)).toEqual({});
  });

  it("rejects an empty vendor name", () => {
    const result = validateVendorInput({
      ...validVendor,
      name: " ",
    });

    expect(result.name).toBe("Vendor name is required.");
  });

  it("rejects an empty category", () => {
    const result = validateVendorInput({
      ...validVendor,
      category: "",
    });

    expect(result.category).toBe(
      "Service category is required."
    );
  });

  it("rejects an invalid website", () => {
    const result = validateVendorInput({
      ...validVendor,
      website: "not-a-valid-url",
    });

    expect(result.website).toBeDefined();
  });

  it("rejects unsupported URL protocols", () => {
    const result = validateVendorInput({
      ...validVendor,
      website: "ftp://example.com",
    });

    expect(result.website).toBe(
      "Website must use HTTP or HTTPS."
    );
  });

  it("allows an empty optional website", () => {
    const result = validateVendorInput({
      ...validVendor,
      website: "",
    });

    expect(result).toEqual({});
  });

  it("rejects descriptions longer than 500 characters", () => {
    const result = validateVendorInput({
      ...validVendor,
      description: "A".repeat(501),
    });

    expect(result.description).toBeDefined();
  });
});
