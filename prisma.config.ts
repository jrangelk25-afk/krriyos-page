import 'dotenv/config'
import { defineConfig } from 'prisma'

export default defineConfig({
  schema: './prisma/schema.prisma',
  seed: './prisma/seed.ts',
  datasources: {
    db: {
      url: process.env.DATABASE_URL || process.env.DIRECT_URL,
    },
  },
})
