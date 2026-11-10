import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { KPIRow } from "@/components/dashboard/kpi-row";
import { IncomeOutcomeChart } from "@/components/dashboard/income-outcome-chart";
import { ProfitPercentChart } from "@/components/dashboard/profit-percent-chart";
import {
  type FinancialMovement,
  type KPIMetrics,
  type MonthlyDataPoint,
  isFinancialMovement,
} from "@/lib/financial-types";
import {
  computeKPIs,
  computeMonthlyData,
  formatMovementPeriod,
} from "@/lib/financial-utils";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

async function fetchFinancialData(signal: AbortSignal): Promise<FinancialMovement[]> {
  const response = await fetch(`${API_BASE_URL}/api/metrics`, { signal });
  if (!response.ok) {
    throw new Error(`Failed to fetch financial data: ${response.status}`);
  }
  const data: unknown = await response.json();
  if (!Array.isArray(data) || !data.every(isFinancialMovement)) {
    throw new Error("Invalid financial metrics response");
  }
  return data as FinancialMovement[];
}

function App() {
  const [movements, setMovements] = useState<FinancialMovement[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadFinancialData() {
      try {
        const data = await fetchFinancialData(controller.signal);
        if (!controller.signal.aborted) setMovements(data);
      } catch {
        if (!controller.signal.aborted) {
          setError(
            "Financial data could not be loaded. Check the backend API and try again.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadFinancialData();
    return () => controller.abort();
  }, []);

  const metrics: KPIMetrics | null = movements ? computeKPIs(movements) : null;
  const monthlyData: MonthlyDataPoint[] = movements
    ? computeMonthlyData(movements)
    : [];

  return (
    <>
      <a className="skip-link" href="#dashboard-content">
        Skip to dashboard content
      </a>
      <main className="dark min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-8">
            <DashboardHeader
              period={movements ? formatMovementPeriod(movements) : "—"}
            />

            <p className="sr-only" role="status" aria-live="polite">
              {loading
                ? "Loading financial dashboard"
                : error
                  ? "Financial dashboard could not be loaded"
                  : "Financial dashboard data loaded"}
            </p>

            <div id="dashboard-content" tabIndex={-1} className="flex flex-col gap-8">
              {error ? (
                <div
                  role="alert"
                  className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive-foreground"
                >
                  {error}
                </div>
              ) : null}

              <section aria-labelledby="kpi-section-title" aria-busy={loading}>
                <h2 id="kpi-section-title" className="sr-only">
                  Key performance indicators
                </h2>
                <KPIRow metrics={metrics} loading={loading} />
              </section>

              <section
                aria-labelledby="charts-section-title"
                aria-busy={loading}
                className="grid grid-cols-1 gap-4 xl:grid-cols-2"
              >
                <h2 id="charts-section-title" className="sr-only">
                  Financial charts
                </h2>
                <IncomeOutcomeChart data={monthlyData} loading={loading} />
                <ProfitPercentChart data={monthlyData} loading={loading} />
              </section>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default App;
