export type OperationType = "income" | "outcome";
export type Category =
  | "suppliers"
  | "sales"
  | "operational"
  | "administrative"
  | "others";
export type BusinessType = "B2B" | "B2C";

export interface FinancialMovement {
  create_date: string; // ISO calendar date
  amount: number;
  operation_type: OperationType;
  category: Category;
  business_type: BusinessType;
}

const categories: readonly Category[] = [
  "suppliers",
  "sales",
  "operational",
  "administrative",
  "others",
];

export function isFinancialMovement(value: unknown): value is FinancialMovement {
  if (typeof value !== "object" || value === null) return false;

  const movement = value as Record<string, unknown>;
  if (
    typeof movement.create_date !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(movement.create_date) ||
    typeof movement.amount !== "number" ||
    !Number.isFinite(movement.amount) ||
    (movement.operation_type !== "income" &&
      movement.operation_type !== "outcome") ||
    !categories.some((category) => category === movement.category) ||
    (movement.business_type !== "B2B" && movement.business_type !== "B2C")
  ) {
    return false;
  }

  const [year, month, day] = movement.create_date.split("-").map(Number);
  const parsedDate = new Date(Date.UTC(year, month - 1, day));
  return (
    parsedDate.getUTCFullYear() === year &&
    parsedDate.getUTCMonth() === month - 1 &&
    parsedDate.getUTCDate() === day
  );
}

export interface KPIMetrics {
  totalIncome: number;
  totalOutcome: number;
  profit: number;
  profitPercent: number;
}

export interface MonthlyDataPoint {
  month: string;
  income: number;
  outcome: number;
  profitPercent: number;
}
