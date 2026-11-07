import { useCallback, useEffect, useState } from "react";

import type {
  Vendor,
  VendorInput,
} from "../../domain/models";

import {
  loadVendors,
  saveVendors,
} from "../../lib/storage/localStorageRepository";

function generateVendorId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `vendor-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function useVendors() {
  const [vendors, setVendors] = useState<Vendor[]>(loadVendors);

  // Save vendor changes whenever the list is updated.
  useEffect(() => {
    saveVendors(vendors);
  }, [vendors]);

  // CREATE
  const addVendor = useCallback((input: VendorInput) => {
    const now = new Date().toISOString();

    const newVendor: Vendor = {
      ...input,
      id: generateVendorId(),
      status: "active",
      createdAt: now,
      updatedAt: now,
    };

    setVendors((currentVendors) => [
      newVendor,
      ...currentVendors,
    ]);

    return newVendor;
  }, []);

  // UPDATE
  const updateVendor = useCallback(
    (id: string, input: VendorInput) => {
      const now = new Date().toISOString();

      setVendors((currentVendors) =>
        currentVendors.map((vendor) =>
          vendor.id === id
            ? {
                ...vendor,
                ...input,
                updatedAt: now,
              }
            : vendor
        )
      );
    },
    []
  );

  // DELETE
  const deleteVendor = useCallback((id: string) => {
    setVendors((currentVendors) =>
      currentVendors.filter((vendor) => vendor.id !== id)
    );
  }, []);

  return {
    vendors,
    addVendor,
    updateVendor,
    deleteVendor,
  };
}