
import { useMemo, useState } from "react";
import {
  Building2,
  Globe,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

import type {
  RiskLevel,
  Vendor,
  VendorInput,
  VendorStatus,
} from "../../domain/models";

import VendorForm from "./VendorForm";

interface VendorManagementProps {
  vendors: Vendor[];
  onAdd: (input: VendorInput) => void;
  onUpdate: (id: string, input: VendorInput) => void;
  onDelete: (id: string) => void;
}

const riskStyles: Record<RiskLevel, string> = {
  low: "bg-emerald-50 text-emerald-700",
  medium: "bg-amber-50 text-amber-700",
  high: "bg-red-50 text-red-700",
};

function VendorManagement({
  vendors,
  onAdd,
  onUpdate,
  onDelete,
}: VendorManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<"all" | VendorStatus>("active");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVendor, setEditingVendor] =
    useState<Vendor | undefined>();

  const filteredVendors = useMemo(() => {
    return vendors.filter((vendor) => {
      const search = searchTerm.toLowerCase();

      const matchesSearch = [
        vendor.name,
        vendor.category,
        vendor.description,
        vendor.website ?? "",
      ].some((value) => value.toLowerCase().includes(search));

      const matchesStatus =
        statusFilter === "all" ||
        vendor.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [vendors, searchTerm, statusFilter]);

  const activeCount = vendors.filter(
    (vendor) => vendor.status === "active"
  ).length;

  const archivedCount = vendors.filter(
    (vendor) => vendor.status === "archived"
  ).length;

  function openNewVendorForm() {
    setEditingVendor(undefined);
    setIsFormOpen(true);
  }

  function openEditVendorForm(vendor: Vendor) {
    setEditingVendor(vendor);
    setIsFormOpen(true);
  }

  function closeForm() {
    setEditingVendor(undefined);
    setIsFormOpen(false);
  }

  function handleSubmit(input: VendorInput) {
    if (editingVendor) {
      onUpdate(editingVendor.id, input);
    } else {
      onAdd(input);
    }

    closeForm();
  }

  function handleDelete(vendor: Vendor) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${vendor.name}? This action cannot be undone.`
    );

    if (confirmed) {
      onDelete(vendor.id);
    }
  }

  function formatDate(date: string) {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  }

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Vendor management
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage your third-party service providers.
          </p>
        </div>

        <button
          onClick={openNewVendorForm}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus size={18} />
          Add vendor
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Total vendors</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {vendors.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Active vendors</p>
          <p className="mt-2 text-2xl font-bold text-emerald-600">
            {activeCount}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Archived vendors</p>
          <p className="mt-2 text-2xl font-bold text-slate-500">
            {archivedCount}
          </p>
        </div>
      </div>

      {/* Add or edit form */}
      {isFormOpen && (
        <VendorForm
          key={editingVendor?.id ?? "new-vendor"}
          initialVendor={editingVendor}
          onSubmit={handleSubmit}
          onCancel={closeForm}
        />
      )}

      {/* Directory */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-2.5 text-slate-400"
            />

            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search vendors..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-9 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />

            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                aria-label="Clear search"
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value as "all" | VendorStatus
              )
            }
            aria-label="Filter vendors by status"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-400"
          >
            <option value="all">All vendors</option>
            <option value="active">Active vendors</option>
            <option value="archived">Archived vendors</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4 font-medium">Vendor</th>
                <th className="px-5 py-4 font-medium">Category</th>
                <th className="px-5 py-4 font-medium">Data classification</th>
                <th className="px-5 py-4 font-medium">Risk assessment</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 text-right font-medium">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredVendors.length > 0 ? (
                filteredVendors.map((vendor) => (
                  <tr
                    key={vendor.id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                          <Building2 size={18} />
                        </div>

                        <div>
                          <p className="font-semibold text-slate-900">
                            {vendor.name}
                          </p>

                          {vendor.website ? (
                            <a
                              href={vendor.website}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-1 inline-flex items-center gap-1 text-xs text-slate-400 hover:text-blue-600"
                            >
                              <Globe size={12} />
                              {vendor.website}
                            </a>
                          ) : (
                            <p className="mt-1 text-xs text-slate-400">
                              No website provided
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {vendor.category}
                    </td>

                    <td className="px-5 py-4 capitalize text-slate-600">
                      {vendor.dataClassification}
                    </td>

                    <td className="px-5 py-4">
                      {vendor.latestAssessment ? (
                        <div>
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${riskStyles[vendor.latestAssessment.riskLevel]}`}
                          >
                            {vendor.latestAssessment.riskLevel}
                          </span>

                          <p className="mt-1 text-xs text-slate-400">
                            {vendor.latestAssessment.score}/100
                            {" · "}
                            {formatDate(
                              vendor.latestAssessment.assessedAt
                            )}
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">
                          Not assessed
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                          vendor.status === "active"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {vendor.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditVendorForm(vendor)}
                          aria-label={`Edit ${vendor.name}`}
                          className="rounded-lg p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(vendor)}
                          aria-label={`Delete ${vendor.name}`}
                          className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center"
                  >
                    <Building2
                      size={30}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 font-medium text-slate-700">
                      No vendors found
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      Try another search or add a new vendor.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-400">
          Showing {filteredVendors.length} of {vendors.length} vendors
        </div>
      </section>
    </div>
  );
}

export default VendorManagement;
