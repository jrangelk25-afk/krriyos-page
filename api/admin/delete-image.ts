import type { ApiRequest, ApiResponse } from '../types'
import jwt from 'jsonwebtoken'
import { createClient } from '@supabase/supabase-js'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

interface JWTPayload {
  id: string
  email: string
  role: string
}

export default async function handler(
  req: ApiRequest,
  res: ApiResponse
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS || '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  try {
    // ============================================
    // 1. VERIFICAR AUTENTICACIÓN
    // ============================================
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token requerido' })
    }

    const token = authHeader.slice(7)
    
    let decoded: JWTPayload
    try {
      decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    } catch (error) {
      return res.status(401).json({ error: 'Token inválido o expirado' })
    }

    // ============================================
    // 2. VALIDAR CREDENCIALES DE SUPABASE
    // ============================================
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error('Credenciales de Supabase no configuradas')
      return res.status(500).json({ error: 'Error de configuración del servidor' })
    }

    // ============================================
    // 3. PARSEAR Y VALIDAR DATOS
    // ============================================
    const { filePath } = req.body

    if (!filePath || typeof filePath !== 'string') {
      return res.status(400).json({ error: 'filePath requerido y debe ser string' })
    }

    // Validar que el path sea seguro (no contiene ..)
    if (filePath.includes('..') || filePath.startsWith('/')) {
      return res.status(400).json({ error: 'Ruta de archivo inválida' })
    }

    // ============================================
    // 4. ELIMINAR DE SUPABASE CON CLAVE DE SERVICIO
    // ============================================
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

    const { error } = await supabase.storage
      .from('krriyos-images')
      .remove([filePath])

    if (error) {
      console.error('Error de Supabase:', error)
      return res.status(400).json({ 
        error: `Error al eliminar imagen: ${error.message}` 
      })
    }

    // ============================================
    // 5. REGISTRAR EN LOGS DE AUDITORÍA (OPCIONAL)
    // ============================================
    console.log(`[DELETE] User ${decoded.email} deleted file: ${filePath}`)

    // ============================================
    // 6. RETORNAR RESPUESTA EXITOSA
    // ============================================
    return res.status(200).json({
      success: true,
      message: 'Imagen eliminada exitosamente',
    })
  } catch (error) {
    console.error('Delete error:', error)
    return res.status(500).json({
      error: 'Error interno del servidor',
    })
  }
}
