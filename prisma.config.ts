import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    // Para migraciones, usa DIRECT_URL (conexión directa, sin pooler)
    // Para runtime, Prisma usa DATABASE_URL del schema
    url: env('DIRECT_URL') || env('DATABASE_URL'),
  },
})
