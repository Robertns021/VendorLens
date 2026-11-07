
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Search,
  ShieldAlert,
  ShieldCheck,
  Users,
} from "lucide-react";

import type {
  DashboardVendor,
  NavSection,
  RiskLevel,
} from "./domain/models";

import { useVendors } from "./features/vendors/useVendors";
import VendorManagement from "./features/vendors/VendorManagement";
import type { RiskDistribution as RiskDistributionData, Vendor } from "./domain/models";

// Navigation configuration
const navigation = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Vendors", icon: Users },
  { label: "Assessments", icon: ClipboardList },
  { label: "Reports", icon: FileText },
] as const;

// Reusable navigation component
function NavigationList({
  activeSection,
  onSelect,
}: {
  activeSection: NavSection;
  onSelect: (section: NavSection) => void;
}) {
  return (
    <nav className="flex gap-2 lg:flex-col lg:gap-1">
      {navigation.map((item) => {
        const Icon = item.icon;
        const isActive = activeSection === item.label;

        return (
          <button
            key={item.label}
            onClick={() => onSelect(item.label)}
            className={`flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              isActive
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Icon size={18} />
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}

// Reusable statistics card
function StatCard({
  title,
  value,
  description,
  icon,
  iconColor,
}: {
  title: string;
  value: string;
  description: string;
  icon: ReactNode;
  iconColor: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">
          {title}
        </p>

        <div className={`rounded-lg p-2 ${iconColor}`}>
          {icon}
        </div>
      </div>

      <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {description}
      </p>
    </div>
  );
}

// Risk classification badge
function RiskBadge({ level }: { level: RiskLevel }) {
  const styles: Record<RiskLevel, string> = {
    low: "bg-emerald-50 text-emerald-700",
    medium: "bg-amber-50 text-amber-700",
    high: "bg-red-50 text-red-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${styles[level]}`}
    >
      {level} risk
    </span>
  );
}

// Risk distribution component
function RiskDistribution({
    distribution,
  }: {
    distribution: RiskDistributionData;
  }) {
  const { low, medium, high } = distribution;

  const total = low + medium + high;

  const lowEnd = (low / total) * 100;
  const mediumEnd = ((low + medium) / total) * 100;

  const chartBackground = `conic-gradient(
    #10b981 0% ${lowEnd}%,
    #f59e0b ${lowEnd}% ${mediumEnd}%,
    #ef4444 ${mediumEnd}% 100%
  )`;

  const categories = [
    {
      label: "Low risk",
      value: low,
      color: "bg-emerald-500",
    },
    {
      label: "Medium risk",
      value: medium,
      color: "bg-amber-500",
    },
    {
      label: "High risk",
      value: high,
      color: "bg-red-500",
    },
  ];

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="font-semibold text-slate-900">
          Risk distribution
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Current vendor risk overview
        </p>
      </div>

      <div className="mt-7 flex flex-col items-center gap-8 sm:flex-row sm:justify-around">
        <div
          className="relative h-40 w-40 shrink-0 rounded-full"
          style={{ background: chartBackground }}
        >
          <div className="absolute inset-5 flex flex-col items-center justify-center rounded-full bg-white">
            <span className="text-3xl font-bold text-slate-900">
              {total}
            </span>
            <span className="text-xs text-slate-500">
              Total vendors
            </span>
          </div>
        </div>

        <div className="w-full space-y-5">
          {categories.map((category) => (
            <div key={category.label}>
              <div className="mb-2 flex justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-600">
                  <span className={`h-2.5 w-2.5 rounded-full ${category.color}`} />
                  {category.label}
                </span>

                <span className="font-semibold text-slate-900">
                  {category.value}
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${category.color}`}
                  style={{
                    width: `${(category.value / total) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Recent vendors table
function RecentVendors({
  vendors,
  onViewAll,
}: {
  vendors: DashboardVendor[];
  onViewAll: () => void;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 p-5">
        <div>
          <h2 className="font-semibold text-slate-900">
            Recent assessments
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Latest vendor risk evaluations
          </p>
        </div>

        <button
          onClick={onViewAll}
          className="text-sm font-semibold text-blue-600 hover:text-blue-800"
        >
          View all
          <ArrowUpRight size={14} className="ml-1 inline" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3 font-medium">Vendor</th>
              <th className="px-5 py-3 font-medium">Category</th>
              <th className="px-5 py-3 font-medium">Risk score</th>
              <th className="px-5 py-3 font-medium">Risk level</th>
              <th className="px-5 py-3 font-medium">Last assessed</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {vendors.length > 0 ? (
              vendors.map((vendor) => (
                <tr key={vendor.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4 font-medium text-slate-900">
                    {vendor.name}
                    <div className="mt-1 text-xs text-slate-400">
                      {vendor.id}
                    </div>
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {vendor.category}
                  </td>

                  <td className="px-5 py-4 font-semibold text-slate-900">
                    {vendor.score}/100
                  </td>

                  <td className="px-5 py-4">
                    <RiskBadge level={vendor.riskLevel} />
                  </td>

                  <td className="px-5 py-4 text-slate-500">
                    {vendor.lastAssessment}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-8 text-center text-slate-500"
                >
                  No matching vendors found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// Main application
function App() {

  const {
    vendors,
    addVendor,
    updateVendor,
    deleteVendor,
  } = useVendors();

  const [activeSection, setActiveSection] =
    useState<NavSection>("Dashboard");

  const [searchTerm, setSearchTerm] = useState("");

  const dashboardVendors = useMemo(() => {
  return vendors
    .filter((vendor): vendor is Vendor & {
      latestAssessment: NonNullable<Vendor["latestAssessment"]>;
    } => Boolean(vendor.latestAssessment))
    .map((vendor) => ({
      id: vendor.id,
      name: vendor.name,
      category: vendor.category,
      score: vendor.latestAssessment.score,
      riskLevel: vendor.latestAssessment.riskLevel,
      lastAssessment: new Date(
        vendor.latestAssessment.assessedAt
      ).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    }));
}, [vendors]);

  const riskCounts = useMemo(() => {
    return vendors.reduce(
      (counts, vendor) => {
        if (vendor.latestAssessment) {
          counts[vendor.latestAssessment.riskLevel]++;
        }

        return counts;
      },
      { low: 0, medium: 0, high: 0 }
    );
  }, [vendors]);

  const filteredVendors = useMemo(() => {
    return dashboardVendors.filter((vendor) =>
      vendor.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [dashboardVendors, searchTerm]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 lg:flex">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col bg-slate-950 px-5 py-7 text-white lg:flex">
        <div className="flex items-center gap-3 px-2">
          <div className="rounded-xl bg-blue-600 p-2.5">
            <ShieldCheck size={24} />
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-tight">
              VendorLens
            </h1>
            <p className="text-xs text-slate-400">
              Security & Risk Platform
            </p>
          </div>
        </div>

        <div className="mt-12">
          <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Workspace
          </p>

          <NavigationList
            activeSection={activeSection}
            onSelect={setActiveSection}
          />
        </div>

        <div className="mt-auto rounded-xl border border-slate-800 bg-slate-900 p-4">
          <div className="flex items-center gap-2 text-blue-400">
            <Activity size={17} />
            <span className="text-sm font-semibold">
              VendorLens Demo
            </span>
          </div>

          <p className="mt-2 text-xs leading-5 text-slate-400">
            Demonstration environment with fictional vendor data.
          </p>
        </div>
      </aside>

      {/* Main content */}
      <div className="min-w-0 flex-1">
        {/* Header */}
        <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-8">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {activeSection}
            </h2>
            <p className="text-xs text-slate-500">
              Vendor security and risk management
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search
                className="absolute left-3 top-2.5 text-slate-400"
                size={17}
              />

              <input
                type="search"
                placeholder="Search recent vendors..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-64 rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
              VL
            </div>
          </div>
        </header>

        {/* Mobile navigation */}
        <div className="border-b border-slate-200 bg-slate-950 px-4 py-3 lg:hidden">
          <div className="mb-3 flex items-center gap-2 text-white">
            <ShieldCheck size={20} className="text-blue-400" />
            <span className="font-bold">VendorLens</span>
          </div>

          <NavigationList
            activeSection={activeSection}
            onSelect={setActiveSection}
          />
        </div>

        <main className="mx-auto max-w-7xl p-5 sm:p-8">
          {activeSection === "Dashboard" ? (
            <>
              <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    Risk overview
                  </h1>

                  <p className="mt-1 text-sm text-slate-500">
                    Monitor your vendors and identify potential risks.
                  </p>
                </div>

                <span className="text-xs text-slate-400">
                  Demonstration data · November 2026
                </span>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  title="Total vendors"
                  value={String(vendors.length)}
                  description="Registered vendors"
                  icon={<Users size={20} />}
                  iconColor="bg-blue-50 text-blue-600"
                />

                <StatCard
                  title="High risk"
                  value={String(riskCounts.high)}
                  description="Require attention"
                  icon={<ShieldAlert size={20} />}
                  iconColor="bg-red-50 text-red-600"
                />

                <StatCard
                  title="Medium risk"
                  value={String(riskCounts.medium)}
                  description="Require monitoring"
                  icon={<Activity size={20} />}
                  iconColor="bg-amber-50 text-amber-600"
                />

                <StatCard
                  title="Low risk"
                  value={String(riskCounts.low)}
                  description="No major identified gaps"
                  icon={<CheckCircle2 size={20} />}
                  iconColor="bg-emerald-50 text-emerald-600"
                />
              </div>

              {/* Risk chart */}
              <div className="mt-6">
                <RiskDistribution distribution={riskCounts} />
              </div>

              {/* Recent assessments */}
              <div className="mt-6">
                <RecentVendors
                  vendors={filteredVendors}
                  onViewAll={() => setActiveSection("Vendors")}
                />
              </div>

              <p className="mt-6 text-center text-xs text-slate-400">
                VendorLens is a portfolio demonstration. All vendor
                information and assessment results are fictional.
              </p>
            </>
          ) :  activeSection === "Vendors" ? (
            <VendorManagement
              vendors={vendors}
              onAdd={addVendor}
              onUpdate={updateVendor}
              onDelete={deleteVendor}
            />
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <LayoutDashboard size={24} />
              </div>

              <h1 className="mt-4 text-xl font-bold text-slate-900">
                {activeSection}
              </h1>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                This section is planned for a future development phase.
                We're currently building the dashboard foundation.
              </p>

              <button
                onClick={() => setActiveSection("Dashboard")}
                className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Return to dashboard
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
