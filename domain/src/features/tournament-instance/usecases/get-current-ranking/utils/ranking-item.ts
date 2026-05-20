import { Id } from "../../../../../core";

export interface RankingItem {
  userId: Id;
  userName: string;
  // userImage: string;
  position: null | number;
  points: number;
  streak: number;
}