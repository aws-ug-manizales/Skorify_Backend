import { BaseAttributes, Entity, Id } from '../../core/entity';

export interface UserAttributes extends BaseAttributes {
  id: Id;
  name: string;
  notificationToken: string;
  email: string;
  image?: string;
}

export class UserEntity extends Entity {
  name: string;
  notificationToken: string;
  email: string;
  image?: string;

  private constructor(attributes: UserAttributes) {
    const { id, name, notificationToken, email, image } = attributes;
    super(id, new Date());
    this.name = name;
    this.email = email;
    this.image = image;
    this.notificationToken = notificationToken;
  }

  static build(params: UserAttributes): UserEntity {
    return new UserEntity(params);
  }
}
