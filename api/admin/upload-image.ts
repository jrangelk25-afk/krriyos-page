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

// Validar tamaño máximo de archivo (11MB para permitir conversión a base64)
const MAX_FILE_SIZE = 11 * 1024 * 1024

// Extensiones permitidas
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif']

// MIME types permitidos
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]

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
    const { fileBase64, fileName, folder } = req.body

    if (!fileBase64 || !fileName || !folder) {
      return res.status(400).json({ 
        error: 'Datos incompletos. Se requieren: fileBase64, fileName, folder' 
      })
    }

    // Validar que folder sea válido
    if (typeof folder !== 'string' || !folder.match(/^[a-zA-Z0-9\-_/]+$/)) {
      return res.status(400).json({ error: 'Nombre de carpeta inválido' })
    }

    // Validar que fileName sea válido
    if (typeof fileName !== 'string' || fileName.length === 0) {
      return res.status(400).json({ error: 'Nombre de archivo inválido' })
    }

    // ============================================
    // 4. VALIDAR EXTENSIÓN Y MIME TYPE
    // ============================================
    const fileExtension = fileName.split('.').pop()?.toLowerCase()
    
    if (!fileExtension || !ALLOWED_EXTENSIONS.includes(fileExtension)) {
      return res.status(400).json({ 
        error: `Extensión no permitida. Permitidas: ${ALLOWED_EXTENSIONS.join(', ')}` 
      })
    }

    // Decodificar base64 para validar
    let buffer: Buffer
    try {
      buffer = Buffer.from(fileBase64, 'base64')
    } catch {
      return res.status(400).json({ error: 'Archivo base64 inválido' })
    }

    // Validar tamaño
    if (buffer.length > MAX_FILE_SIZE) {
      return res.status(400).json({ 
        error: `Archivo demasiado grande. Máximo: ${MAX_FILE_SIZE / 1024 / 1024}MB` 
      })
    }

    // Validar que no esté vacío
    if (buffer.length === 0) {
      return res.status(400).json({ error: 'Archivo vacío' })
    }

    // ============================================
    // 5. SUBIR A SUPABASE CON CLAVE DE SERVICIO
    // ============================================
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

    // Generar nombre único con timestamp y usuario ID
    const timestamp = Date.now()
    const uniqueFileName = `${timestamp}-${decoded.id.slice(0, 8)}-${fileName}`
    const filePath = `${folder}/${uniqueFileName}`

    const { data, error } = await supabase.storage
      .from('krriyos-images')
      .upload(filePath, buffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`,
      })

    if (error) {
      console.error('Error de Supabase:', error)
      return res.status(400).json({ 
        error: `Error al subir imagen: ${error.message}` 
      })
    }

    // ============================================
    // 6. OBTENER URL PÚBLICA
    // ============================================
    const { data: publicUrl } = supabase.storage
      .from('krriyos-images')
      .getPublicUrl(data.path)

    // ============================================
    // 7. REGISTRAR EN LOGS DE AUDITORÍA (OPCIONAL)
    // ============================================
    console.log(`[UPLOAD] User ${decoded.email} uploaded file: ${filePath}`)

    // ============================================
    // 8. RETORNAR RESPUESTA EXITOSA
    // ============================================
    return res.status(200).json({
      success: true,
      path: data.path,
      publicUrl: publicUrl.publicUrl,
      fileName: uniqueFileName,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return res.status(500).json({
      error: 'Error interno del servidor',
    })
  }
}
