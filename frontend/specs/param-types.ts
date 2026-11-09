import type {
  BusinessType,
  OperationType,
} from "../src/lib/financial-types";

/**
 * Optional inclusive date bounds shared by supported metrics queries.
 * The frontend-facing properties are camelCase; map them to the API query keys
 * `start_date` and `end_date` when building the HTTP request.
 */
export interface DateRangeFilter {
  /**
   * Inclusive lower bound for `create_date` filtering.
   * Provide a calendar date as a string in `YYYY-MM-DD` format (for example, `2026-01-31`).
    * Serialize this property as the API query parameter `start_date`.
   */
  startDate?: string;

  /**
   * Inclusive upper bound for `create_date` filtering.
   * Provide a calendar date as a string in `YYYY-MM-DD` format (for example, `2026-12-31`).
    * Serialize this property as the API query parameter `end_date`.
   */
  endDate?: string;
}

/** Query parameters accepted by `GET /api/metrics/alerts`. */
export interface AlertsParams extends DateRangeFilter {
  /**
   * Minimum relative increase over the historical outcome baseline required to emit an alert.
   * The API accepts a number greater than or equal to `0` and defaults to `0.3`;
    * The product-requested frontend range is `0.01` through `1.0` inclusive;
    * the range needs runtime validation because TypeScript's `number` type alone
    * cannot enforce it.
   */
  threshold: number;

  /**
   * Aggregation granularity used for `period`: `day`, `week`, or `month`.
   * Defaults to `month` in the API.
   */
  group_by?: "day" | "week" | "month";

  /** Optional business segment to include: `B2B` or `B2C`. */
  business_type?: BusinessType;
}

/** Query parameters accepted by `GET /api/metrics/categories/top`. */
export interface TopCategoriesParams extends DateRangeFilter {
  /** Operation to rank, either `income` or `outcome`; the API defaults to `outcome`. */
  operation_type: OperationType;

  /** Maximum number of ranked categories to return; valid API range is the integer `1`–`20` inclusive. */
  limit: number;

  /** Optional business segment for a segmented comparison: `B2B` or `B2C`; omit to include both. */
  business_type?: BusinessType;
}
