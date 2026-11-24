import { useCallback, useEffect, useState } from "react";

import type {
  AssessmentSummary,
  Vendor,
  VendorInput,
} from "../../domain/models";

import {
  archiveVendor,
  createVendor,
  fetchVendors,
  updateVendorRequest,
} from "../../lib/api/vendors";

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "An unexpected error occurred.";
}

export function useVendors() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // LOAD: retrieve vendors from the backend when the hook mounts.
  useEffect(() => {
    let isCurrent = true;

    async function loadData() {
      try {
        const data = await fetchVendors();

        if (isCurrent) {
          setVendors(data);
          setError(null);
        }
      } catch (error) {
        if (isCurrent) {
          setError(getErrorMessage(error));
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    void loadData();

    return () => {
      isCurrent = false;
    };
  }, []);

  // CREATE
  const addVendor = useCallback(async (input: VendorInput) => {
    try {
      const newVendor = await createVendor(input);

      setVendors((current) => [newVendor, ...current]);
      setError(null);

      return newVendor;
    } catch (error) {
      setError(getErrorMessage(error));
      throw error;
    }
  }, []);

  // UPDATE
  const updateVendor = useCallback(
    async (id: string, input: VendorInput) => {
      try {
        const updatedVendor = await updateVendorRequest(id, input);

        setVendors((current) =>
          current.map((vendor) =>
            vendor.id === id ? updatedVendor : vendor
          )
        );

        setError(null);
      } catch (error) {
        setError(getErrorMessage(error));
        throw error;
      }
    },
    []
  );

  // ARCHIVE
  const deleteVendor = useCallback(async (id: string) => {
    try {
      const archivedVendor = await archiveVendor(id);

      setVendors((current) =>
        current.map((vendor) =>
          vendor.id === id ? archivedVendor : vendor
        )
      );

      setError(null);
    } catch (error) {
      setError(getErrorMessage(error));
      throw error;
    }
  }, []);

  // UPDATE: Keep the latest assessment summary in frontend state.
  // Assessment persistence will be moved to the API in a later stage.
  const updateVendorAssessment = useCallback(
    (id: string, summary: AssessmentSummary) => {
      setVendors((current) =>
        current.map((vendor) =>
          vendor.id === id
            ? {
                ...vendor,
                latestAssessment: summary,
                updatedAt: new Date().toISOString(),
              }
            : vendor
        )
      );
    },
    []
  );

  return {
    vendors,
    isLoading,
    error,
    addVendor,
    updateVendor,
    deleteVendor,
    updateVendorAssessment,
  };
}
