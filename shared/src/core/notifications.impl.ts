import { NotificationContract, NotificationType } from "@skorify/domain/core";
import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";
export class NotificationImpl extends NotificationContract {
  sns: SNSClient;
  mapper: Map<
    NotificationType,
    {
      title: string;
      body: string;
    }
  >;
  constructor() {
    super();
    this.sns = new SNSClient({
      region: "us-east-1",
    });
    this.mapper = new Map();

    this.mapper.set("player-passed", {
      body: "Has pasado a",
      title: "Has pasado a",
    });
    this.mapper.set("player-overtaken", {
      body: "Has sido sobrepasado",
      title: "Has sido sobrepasado",
    });
    this.mapper.set("match-closed", {
      body: "Partido cerrado",
      title: "Partido cerrado",
    });
  }
  async send(
    phoneId: string,
    notificationType: NotificationType,
    data: Record<string, string>,
  ): Promise<boolean> {
    const info = this.mapper.get(notificationType);

    if (!info) {
      return false;
    }

    const response = await this.sns.send(
      new PublishCommand({
        TargetArn: phoneId,
        MessageStructure: "json",
        Message: JSON.stringify({
          GCM: JSON.stringify({
            notification: info,
            data,
          }),
        }),
      }),
    );
    return !!response.MessageId;
  }
}
