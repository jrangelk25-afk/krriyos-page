import { createClient, RedisClientType } from 'redis'

let redisClient: RedisClientType | null = null
let isConnected = false

/**
 * Get or create Redis client
 * Falls back to in-memory cache if Redis is not available
 */
export async function getRedisClient(): Promise<RedisClientType | null> {
  if (redisClient) {
    return redisClient
  }

  const redisUrl = process.env.REDIS_URL

  if (!redisUrl) {
    console.log('⚠️  REDIS_URL not configured. Using in-memory cache fallback.')
    return null
  }

  try {
    redisClient = createClient({
      url: redisUrl,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            console.error('❌ Redis reconnection failed after 10 attempts')
            return new Error('Redis max retries exceeded')
          }
          return retries * 50
        },
      },
    })

    redisClient.on('error', (err) => console.log('🔴 Redis error:', err))
    redisClient.on('connect', () => console.log('🟢 Redis connected'))
    redisClient.on('ready', () => {
      console.log('✅ Redis ready')
      isConnected = true
    })
    redisClient.on('reconnecting', () => console.log('🔄 Redis reconnecting...'))

    await redisClient.connect()
    return redisClient
  } catch (error) {
    console.error('❌ Redis connection error:', error)
    redisClient = null
    return null
  }
}

/**
 * In-memory cache fallback (simple Map-based cache)
 */
const inMemoryCache = new Map<string, { value: any; expiresAt: number }>()

/**
 * Set cache value (Redis if available, fallback to in-memory)
 */
export async function setCacheValue(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
  try {
    const client = await getRedisClient()
    const serialized = JSON.stringify(value)

    if (client && isConnected) {
      await client.setEx(key, ttlSeconds, serialized)
      return
    }
  } catch (error) {
    console.warn(`⚠️  Failed to set Redis cache for ${key}:`, error)
  }

  // Fallback to in-memory
  const expiresAt = Date.now() + ttlSeconds * 1000
  inMemoryCache.set(key, { value, expiresAt })
}

/**
 * Get cache value (Redis if available, fallback to in-memory)
 */
export async function getCacheValue<T>(key: string): Promise<T | null> {
  try {
    const client = await getRedisClient()

    if (client && isConnected) {
      const cached = await client.get(key)
      if (cached) {
        return JSON.parse(cached) as T
      }
      return null
    }
  } catch (error) {
    console.warn(`⚠️  Failed to get Redis cache for ${key}:`, error)
  }

  // Fallback to in-memory
  const cached = inMemoryCache.get(key)
  if (cached) {
    if (cached.expiresAt > Date.now()) {
      return cached.value as T
    } else {
      inMemoryCache.delete(key)
    }
  }

  return null
}

/**
 * Delete cache value
 */
export async function deleteCacheValue(key: string): Promise<void> {
  try {
    const client = await getRedisClient()

    if (client && isConnected) {
      await client.del(key)
      return
    }
  } catch (error) {
    console.warn(`⚠️  Failed to delete Redis cache for ${key}:`, error)
  }

  // Fallback to in-memory
  inMemoryCache.delete(key)
}

/**
 * Delete cache keys by pattern (Redis KEYS command)
 */
export async function deleteCachePattern(pattern: string): Promise<void> {
  try {
    const client = await getRedisClient()

    if (client && isConnected) {
      const keys = await client.keys(pattern)
      if (keys.length > 0) {
        await client.del(keys)
      }
      return
    }
  } catch (error) {
    console.warn(`⚠️  Failed to delete Redis cache pattern ${pattern}:`, error)
  }

  // Fallback to in-memory (simple pattern matching)
  const regex = new RegExp(pattern.replace(/\*/g, '.*'))
  for (const key of inMemoryCache.keys()) {
    if (regex.test(key)) {
      inMemoryCache.delete(key)
    }
  }
}

/**
 * Get or fetch value with caching
 * Higher-level utility for typical cache-aside pattern
 */
export async function getCachedOrFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 300
): Promise<T> {
  // Try to get from cache first
  const cached = await getCacheValue<T>(key)
  if (cached !== null) {
    return cached
  }

  // Not in cache, fetch fresh data
  const data = await fetcher()

  // Store in cache for future requests
  await setCacheValue(key, data, ttlSeconds)

  return data
}

/**
 * Graceful shutdown
 */
export async function disconnectRedis(): Promise<void> {
  if (redisClient && isConnected) {
    try {
      await redisClient.disconnect()
      console.log('✅ Redis disconnected')
    } catch (error) {
      console.error('❌ Redis disconnect error:', error)
    }
  }
}

/**
 * Clear in-memory cache (useful for testing)
 */
export function clearInMemoryCache(): void {
  inMemoryCache.clear()
}

/**
 * Get cache stats (for debugging)
 */
export function getInMemoryCacheStats(): { size: number; keys: string[] } {
  return {
    size: inMemoryCache.size,
    keys: Array.from(inMemoryCache.keys()),
  }
}
