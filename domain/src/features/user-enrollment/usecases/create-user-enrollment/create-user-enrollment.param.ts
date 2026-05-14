import { Id } from "../../../../core";

export interface CreateUserEnrollmentParam {
  userId: Id;
  tournamentInstanceId: Id;
  joinedAt?: Date;
  lastPosition?: number;
  currentPosition?: number;
  currentScore?: number;
  streak?: number;
}