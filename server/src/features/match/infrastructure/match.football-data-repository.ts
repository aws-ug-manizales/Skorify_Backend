import {
  MatchContract,
  MatchEntity,
  GetFutureMatchesParams,
} from "@skorify/domain/match";

/**
 * Repository implementation that consumes the Football Data API
 * API Docs: https://docs.football-data.org/general/v4/index.html
 */
export class FootballDataRepository extends MatchContract {
  private readonly API_BASE_URL = "https://api.football-data.org/v4";
  private readonly API_TOKEN: string;

  constructor(apiToken: string) {
    super();
    this.API_TOKEN = apiToken;
  }

  /**
   * Get future matches from the Football Data API
   * @param params - Parameters including dateFrom (in Colombia GMT-5)
   */
  async getFutureMatches(
    params: GetFutureMatchesParams,
  ): Promise<MatchEntity[]> {
    try {
      // Convert Colombia time (GMT-5) to UTC for the API
      const dateFrom = this.convertColombiaToUTC(params.dateFrom);
      const dateTo = params.dateTo
        ? this.convertColombiaToUTC(params.dateTo)
        : undefined;

      // Build query parameters
      const queryParams = new URLSearchParams();
      queryParams.append("dateFrom", this.formatDateForAPI(dateFrom));
      
      if (dateTo) {
        queryParams.append("dateTo", this.formatDateForAPI(dateTo));
      }

      if (params.competitions && params.competitions.length > 0) {
        queryParams.append("competitions", params.competitions.join(","));
      }

      // Call the Football Data API
      const url = `${this.API_BASE_URL}/matches?${queryParams.toString()}`;
      const response = await fetch(url, {
        headers: {
          "X-Auth-Token": this.API_TOKEN,
        },
      });

      if (!response.ok) {
        throw new Error(
          `Football Data API error: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      
      // Transform API response to our domain entities
      const matches: MatchEntity[] = (data.matches || []).map(
        (match: any) => this.transformToMatchEntity(match),
      );

      // Apply limit if specified
      if (params.limit && params.limit > 0) {
        return matches.slice(0, params.limit);
      }

      return matches;
    } catch (error) {
      console.error("Error fetching future matches:", error);
      throw error;
    }
  }

  /**
   * Get a match by its ID
   */
  async getById(id: string): Promise<MatchEntity | null> {
    try {
      const url = `${this.API_BASE_URL}/matches/${id}`;
      const response = await fetch(url, {
        headers: {
          "X-Auth-Token": this.API_TOKEN,
        },
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(
          `Football Data API error: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      return this.transformToMatchEntity(data);
    } catch (error) {
      console.error(`Error fetching match by ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Convert Colombia time (GMT-5) to UTC
   * @param date - Date in Colombia timezone
   * @returns Date in UTC
   */
  private convertColombiaToUTC(date: string | Date): Date {
    const inputDate = typeof date === "string" ? new Date(date) : date;
    
    // Colombia is GMT-5 (no daylight saving time)
    // Add 5 hours to convert from Colombia time to UTC
    const utcDate = new Date(inputDate.getTime() + 5 * 60 * 60 * 1000);
    
    return utcDate;
  }

  /**
   * Format date for the Football Data API (YYYY-MM-DD)
   */
  private formatDateForAPI(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  /**
   * Transform Football Data API match object to our MatchEntity
   */
  private transformToMatchEntity(apiMatch: any): MatchEntity {
    return {
      id: String(apiMatch.id) as any,
      utcDate: apiMatch.utcDate,
      status: apiMatch.status,
      matchday: apiMatch.matchday,
      stage: apiMatch.stage,
      homeTeam: {
        id: apiMatch.homeTeam.id,
        name: apiMatch.homeTeam.name,
        shortName: apiMatch.homeTeam.shortName,
        tla: apiMatch.homeTeam.tla,
        crest: apiMatch.homeTeam.crest,
      },
      awayTeam: {
        id: apiMatch.awayTeam.id,
        name: apiMatch.awayTeam.name,
        shortName: apiMatch.awayTeam.shortName,
        tla: apiMatch.awayTeam.tla,
        crest: apiMatch.awayTeam.crest,
      },
      score: apiMatch.score
        ? {
            winner: apiMatch.score.winner,
            duration: apiMatch.score.duration,
            fullTime: apiMatch.score.fullTime,
            halfTime: apiMatch.score.halfTime,
          }
        : undefined,
      competition: apiMatch.competition
        ? {
            id: apiMatch.competition.id,
            name: apiMatch.competition.name,
            code: apiMatch.competition.code,
            emblem: apiMatch.competition.emblem,
          }
        : undefined,
      season: apiMatch.season
        ? {
            id: apiMatch.season.id,
            startDate: apiMatch.season.startDate,
            endDate: apiMatch.season.endDate,
            currentMatchday: apiMatch.season.currentMatchday,
          }
        : undefined,
    };
  }
}
