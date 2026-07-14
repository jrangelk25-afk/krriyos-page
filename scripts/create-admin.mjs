#!/usr/bin/env node

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function createAdmin() {
  const email = 'admin@empresa.com'
  const password = '12345678'
  const fullName = 'Administrador Empresa'

  try {
    console.log('🔐 Creando admin...')

    // Generar hash de contraseña
    const passwordHash = await bcrypt.hash(password, 10)
    console.log('✅ Contraseña hasheada')

    // Crear o actualizar admin
    const admin = await prisma.adminUser.upsert({
      where: { email },
      update: {
        passwordHash,
        fullName,
      },
      create: {
        email,
        fullName,
        passwordHash,
        role: 'ADMIN',
        isActive: true,
      },
    })

    console.log('✅ Admin creado/actualizado:')
    console.log(`
    ID: ${admin.id}
    Email: ${admin.email}
    Nombre: ${admin.fullName}
    Rol: ${admin.role}
    Activo: ${admin.isActive}
    `)
    console.log(`
✅ LISTO PARA PRUEBAS:
  Email: ${email}
  Contraseña: ${password}
    `)
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()
