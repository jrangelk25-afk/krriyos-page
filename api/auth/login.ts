import type { ApiRequest, ApiResponse } from '../types'
import jwt from 'jsonwebtoken'
const { PrismaClient } = require('@prisma/client')
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_EXPIRES_IN = '7d'

interface LoginRequest {
  email: string
  password: string
}

interface LoginResponse {
  token: string
  admin: {
    id: string
    email: string
    fullName: string
    role: string
  }
}

export default async function handler(
  req: ApiRequest,
  res: ApiResponse
) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email, password } = req.body as LoginRequest

    // Validar entrada
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email y contraseña son requeridos',
      })
    }

    // Validar formato de email
    if (!email.includes('@')) {
      return res.status(400).json({
        error: 'Email inválido',
      })
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      return res.status(400).json({
        error: 'Contraseña debe tener al menos 6 caracteres',
      })
    }

    // Buscar admin en BD
    const admin = await prisma.adminUser.findUnique({
      where: { email },
    })

    if (!admin || !admin.isActive) {
      return res.status(401).json({
        error: 'Credenciales inválidas o usuario inactivo',
      })
    }

    // Verificar contraseña con bcrypt
    let passwordMatch = false
    try {
      passwordMatch = await bcrypt.compare(password, admin.passwordHash)
    } catch (error) {
      console.error('Error comparing passwords:', error)
      return res.status(500).json({
        error: 'Error verificando credenciales',
      })
    }

    if (!passwordMatch) {
      return res.status(401).json({
        error: 'Credenciales inválidas',
      })
    }

    // Generar JWT
    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    )

    // Actualizar lastLogin
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { lastLogin: new Date() },
    })

    const response: LoginResponse = {
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        fullName: admin.fullName,
        role: admin.role,
      },
    }

    return res.status(200).json(response)
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({
      error: 'Error interno del servidor',
    })
  } finally {
    await prisma.$disconnect()
  }
}
