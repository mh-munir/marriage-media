declare module "ioredis" {
  interface RedisOptions {
    maxRetriesPerRequest?: number;
    retryStrategy?: (times: number) => number | null;
  }

  class Redis {
    constructor(url?: string, options?: RedisOptions);
    get(key: string): Promise<string | null>;
    set(key: string, value: string, ...args: unknown[]): Promise<string>;
    del(...keys: string[]): Promise<number>;
    keys(pattern: string): Promise<string[]>;
    disconnect(): Promise<void>;
  }

  export default Redis;
}