export type NotificationType = "player-passed" | "player-overtaken" | "match-closed";

export abstract class NotificationContract {
  abstract send(
    phoneId: string,
    notificationType: NotificationType,
    data: Record<string, string>,
  ): Promise<boolean>;
}
