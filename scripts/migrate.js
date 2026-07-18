import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { execSync } from 'child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

console.log('Loading env from:', join(projectRoot, '.env'))
dotenv.config({ path: join(projectRoot, '.env') })

console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✓ loaded' : '✗ not loaded')

try {
  console.log('Running prisma migrate deploy...')
  const result = execSync('pnpm exec prisma migrate deploy --skip-generate', {
    cwd: projectRoot,
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL }
  })
  console.log('✅ Migration deployed successfully')
} catch (error) {
  console.error('❌ Migration failed:', error.message)
  process.exit(1)
}
