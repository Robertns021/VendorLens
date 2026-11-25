import type { Vendor, VendorInput } from "../../domain/models";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001"
).replace(/\/+$/, "");

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  let data: unknown = null;

  try {
    data = await response.json();
  } catch {
    // The server may return an empty response.
  }

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    if (typeof data === "object" && data !== null && "error" in data) {
      const serverError = data.error;

      if (typeof serverError === "string") {
        message = serverError;
      }
    }

    throw new Error(message);
  }

  return data as T;
}

// GET: retrieve all vendors.
export async function fetchVendors(): Promise<Vendor[]> {
  const response = await request<{ vendors: Vendor[] }>("/api/vendors");
  return response.vendors;
}

// POST: create a vendor.
export async function createVendor(
  input: VendorInput
): Promise<Vendor> {
  const response = await request<{ vendor: Vendor }>("/api/vendors", {
    method: "POST",
    body: JSON.stringify(input),
  });

  return response.vendor;
}

// PUT: update a vendor.
export async function updateVendorRequest(
  id: string,
  input: VendorInput
): Promise<Vendor> {
  const response = await request<{ vendor: Vendor }>(
    `/api/vendors/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      body: JSON.stringify(input),
    }
  );

  return response.vendor;
}

// DELETE: archive a vendor.
export async function archiveVendor(
  id: string
): Promise<Vendor> {
  const response = await request<{ vendor: Vendor }>(
    `/api/vendors/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    }
  );

  return response.vendor;
}
