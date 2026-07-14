#!/usr/bin/env node

/**
 * Script para generar hash de contraseña con bcrypt
 * Uso: node scripts/hash-password.js "tu-contraseña"
 */

import bcrypt from 'bcrypt'

const password = process.argv[2]

if (!password) {
  console.error('❌ Error: Debes proporcionar una contraseña')
  console.error('Uso: node scripts/hash-password.js "tu-contraseña"')
  process.exit(1)
}

if (password.length < 6) {
  console.error('❌ Error: La contraseña debe tener al menos 6 caracteres')
  process.exit(1)
}

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('❌ Error:', err.message)
    process.exit(1)
  }

  console.log('✅ Hash generado:')
  console.log(hash)
  console.log('')
  console.log('Copiar este hash en tu BD con:')
  console.log(`UPDATE admin_users SET password_hash = '${hash}' WHERE email = 'your-email@example.com';`)
})
