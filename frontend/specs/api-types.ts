import type {
  BusinessType,
  Category,
  OperationType,
} from "../src/lib/financial-types";

/**
 * Facets and available date bounds returned by `GET /api/metrics/facets`.
 * Date fields are ISO-8601 calendar dates (`YYYY-MM-DD`), not timestamps.
 */
export interface FacetsResponse {
  /** Operation values available in the generated data: `income` or `outcome`. */
  operation_types: OperationType[];

  /** Business segments available in the generated data: `B2B` or `B2C`. */
  business_types: BusinessType[];

  /** Financial categories present in the generated data. */
  categories: Category[];

  /** Earliest movement date available, serialized as `YYYY-MM-DD`. */
  min_date: string;

  /** Latest movement date available, serialized as `YYYY-MM-DD`. */
  max_date: string;
}

/**
 * One anomaly row returned by `GET /api/metrics/alerts`.
 */
export interface AlertEntry {
  /** Period label for the aggregate; format depends on `group_by` (for example, `YYYY-MM` when grouped by month). */
  period: string;

  /** Sum of outcome amounts for this period, in the API's monetary units. */
  outcome_total: number;

  /** Arithmetic mean of outcome totals in the earlier periods used as the baseline, in the same monetary units. */
  baseline_average: number;

  /** Relative increase over the baseline as a decimal ratio (for example, `0.3` means 30%, not `0.3%`). */
  increase_ratio: number;
}

/** The response body is a JSON array of anomaly rows; it may be empty. */
export type AlertsResponse = AlertEntry[];

/**
 * One category aggregate returned by `GET /api/metrics/categories/top`.
 */
export interface CategoryEntry {
  /** Financial category for this aggregate. */
  category: Category;

  /** Operation represented by the aggregate: `income` or `outcome`. */
  operation_type: OperationType;

  /** Sum of movement amounts for this category and operation, in the API's monetary units. */
  total_amount: number;
}

/** The response body is a JSON array ordered by `total_amount` descending; it may contain fewer items than the requested limit. */
export type TopCategoriesResponse = CategoryEntry[];
