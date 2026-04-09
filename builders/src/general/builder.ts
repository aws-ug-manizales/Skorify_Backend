export interface BuilderConfiguration {
  root: string;
  serverFolder: string;
}
export abstract class Builder {
  abstract build(config: BuilderConfiguration): Promise<void>;
}
