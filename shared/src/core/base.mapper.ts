import { DomainEvent, Entity } from '@skorify/domain/core';

export abstract class BaseMapper<Attrs> {
  abstract fromJson(data: Record<string, any> ): DomainEvent;
  abstract toJson(entity: Entity): Attrs;
}
