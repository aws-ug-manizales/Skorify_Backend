/**
 * Parameters for getting future matches
 */
export interface GetFutureMatchesParam {
  /**
   * Current date in Colombia GMT-5 timezone
   * Format: ISO 8601 string or Date object
   */
  currentDate: string | Date;
  
  /**
   * Optional: Days ahead to search (default: 30)
   */
  daysAhead?: number;
  
  /**
   * Optional: Competition IDs to filter
   */
  competitionIds?: number[];
  
  /**
   * Optional: Limit number of results
   */
  limit?: number;
}
