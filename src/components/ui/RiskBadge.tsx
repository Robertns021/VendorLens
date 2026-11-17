import type { RiskLevel } from "../../domain/models";

interface RiskBadgeProps {
  level: RiskLevel;
}

const styles: Record<RiskLevel, string> = {
  low: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  medium: "bg-amber-50 text-amber-700 ring-amber-600/20",
  high: "bg-red-50 text-red-700 ring-red-600/20",
};

function RiskBadge({ level }: RiskBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${styles[level]}`}>
      {level} risk
    </span>
  );
}

export default RiskBadge;
