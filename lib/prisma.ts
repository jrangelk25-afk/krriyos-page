import pkg from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const { PrismaClient } = pkg

let prisma: InstanceType<typeof PrismaClient> | null = null

export const getPrisma = () => {
  if (prisma) return prisma

  const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL
  
  if (!connectionString) {
    throw new Error('DATABASE_URL or DIRECT_URL environment variable must be set')
  }

  // Usar adaptador pg con pool
  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  
  prisma = new PrismaClient({ adapter })

  return prisma
}

export default { getPrisma }
