import type { Vendor, RiskLevel } from "../../domain/models";
import { demoVendors } from "../../data/demoData";

const STORAGE_KEY = "vendorlens.vendors.v1";

function isRiskLevel(value: unknown): value is RiskLevel {
  return (
    value === "low" ||
    value === "medium" ||
    value === "high"
  );
}

function isVendor(value: unknown): value is Vendor {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const vendor = value as Record<string, unknown>;

  const validAssessment =
    vendor.latestAssessment === undefined ||
    (
      typeof vendor.latestAssessment === "object" &&
      vendor.latestAssessment !== null &&
      typeof (vendor.latestAssessment as Record<string, unknown>).score === "number" &&
      isRiskLevel(
        (vendor.latestAssessment as Record<string, unknown>).riskLevel
      ) &&
      typeof (vendor.latestAssessment as Record<string, unknown>).assessedAt === "string"
    );

  return (
    typeof vendor.id === "string" &&
    typeof vendor.name === "string" &&
    (vendor.website === undefined || typeof vendor.website === "string") &&
    typeof vendor.category === "string" &&
    typeof vendor.description === "string" &&
    (
      vendor.dataClassification === "public" ||
      vendor.dataClassification === "internal" ||
      vendor.dataClassification === "confidential"
    ) &&
    (vendor.status === "active" || vendor.status === "archived") &&
    typeof vendor.createdAt === "string" &&
    typeof vendor.updatedAt === "string" &&
    validAssessment
  );
}

export function loadVendors(): Vendor[] {
  try {
    if (typeof window === "undefined") {
      return demoVendors;
    }

    const savedData = window.localStorage.getItem(STORAGE_KEY);

    if (savedData === null) {
      return demoVendors;
    }

    const parsedData: unknown = JSON.parse(savedData);

    if (
      Array.isArray(parsedData) &&
      parsedData.every(isVendor)
    ) {
      return parsedData;
    }

    console.warn("Invalid saved vendor data. Loading demo data.");
    return demoVendors;
  } catch (error) {
    console.error("Could not load vendor data:", error);
    return demoVendors;
  }
}

export function saveVendors(vendors: Vendor[]): void {
  try {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(vendors)
    );
  } catch (error) {
    console.error("Could not save vendor data:", error);
  }
}