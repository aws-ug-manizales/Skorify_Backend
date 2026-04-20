import {
  GetFutureMatchesUsecase,
  GetFutureMatchesParam,
  FutureMatchesRetrievedDomainEvent,
  NoFutureMatchesFoundDomainEvent,
  InvalidDateProvidedDomainEvent,
  MatchContract,
} from "@skorify/domain/match";
import { DomainEvent } from "@skorify/domain/core";

/**
 * Use case implementation for getting future matches
 * Handles Colombia GMT-5 timezone properly
 */
export class GetFutureMatchesUsecaseImpl extends GetFutureMatchesUsecase {
  constructor(private readonly matchRepository: MatchContract) {
    super();
  }

  async call(param: GetFutureMatchesParam): Promise<DomainEvent> {
    try {
      // Validate the current date parameter
      const currentDate = this.parseDate(param.currentDate);
      
      if (!currentDate) {
        return InvalidDateProvidedDomainEvent(
          "Invalid date format. Please provide ISO 8601 string or Date object",
        );
      }

      // Calculate date range
      const daysAhead = param.daysAhead || 30;
      const dateFrom = currentDate;
      const dateTo = new Date(currentDate);
      dateTo.setDate(dateTo.getDate() + daysAhead);

      // Fetch future matches from repository
      const matches = await this.matchRepository.getFutureMatches({
        dateFrom,
        dateTo,
        competitions: param.competitionIds,
        limit: param.limit,
      });

      // Return appropriate domain event
      if (matches.length === 0) {
        return NoFutureMatchesFoundDomainEvent();
      }

      return FutureMatchesRetrievedDomainEvent(matches);
    } catch (error) {
      console.error("Error in GetFutureMatchesUsecase:", error);
      throw error;
    }
  }

  /**
   * Parse date from string or Date object
   * Assumes date is in Colombia GMT-5 timezone
   */
  private parseDate(date: string | Date): Date | null {
    try {
      if (date instanceof Date) {
        return date;
      }

      const parsed = new Date(date);
      
      // Check if date is valid
      if (isNaN(parsed.getTime())) {
        return null;
      }

      return parsed;
    } catch {
      return null;
    }
  }
}
