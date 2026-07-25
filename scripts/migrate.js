#!/usr/bin/env node

// Script para ejecutar migrations cargando .env correctamente
import dotenv from 'dotenv'
import { execSync } from 'child_process'
import fs from 'fs'

// Cargar variables de .env
dotenv.config()

console.log('📦 Loading .env variables...')
console.log('DATABASE_URL loaded:', process.env.DATABASE_URL ? '✅' : '❌')
console.log('DIRECT_URL loaded:', process.env.DIRECT_URL ? '✅' : '❌')

if (!process.env.DATABASE_URL && !process.env.DIRECT_URL) {
  console.error('❌ ERROR: DATABASE_URL or DIRECT_URL not found in .env')
  process.exit(1)
}

console.log('\n🚀 Running: npx prisma migrate deploy\n')

try {
  // Crear script temporario que ejecuta prisma con ENV
  const tempScript = `
import('dotenv/config.js')
import { execSync } from 'child_process'
execSync('npx prisma migrate deploy', { stdio: 'inherit', env: process.env })
  `
  
  // Ejecutar prisma migrate deploy
  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: process.env.DATABASE_URL,
      DIRECT_URL: process.env.DIRECT_URL
    }
  })
  console.log('\n✅ Migration completed successfully!')
} catch (error) {
  console.error('\n❌ Migration failed!')
  console.error('Error:', error.message)
  process.exit(1)
}
