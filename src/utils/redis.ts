import * as Redis from "redis";

const redis = Redis.createClient({
  url: process.env.REDIS_URL,
});

redis.connect().catch(console.error);

export { redis };
