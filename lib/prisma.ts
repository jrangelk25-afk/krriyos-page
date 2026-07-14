import pkg from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const { PrismaClient } = pkg
const { Pool } = pg

const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL

let prisma: InstanceType<typeof PrismaClient>

if (process.env.NODE_ENV === 'production') {
  // Production: reuse connection pool
  const pool = new Pool({ connectionString, max: 20 })
  const adapter = new PrismaPg(pool)
  prisma = new PrismaClient({ adapter })
} else {
  // Development: create new instance
  prisma = new PrismaClient()
}

export default prisma
