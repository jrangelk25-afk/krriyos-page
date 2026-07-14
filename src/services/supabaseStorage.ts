import { createClient } from '@supabase/supabase-js'
import { useAuthStore } from '../stores/authStore'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Credenciales de Supabase no encontradas en variables de entorno')
}

// Cliente de Supabase solo para lectura de URLs públicas
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

const BUCKET_NAME = 'krriyos-images'

/**
 * Sube una imagen al servidor a través de un endpoint seguro
 * @param file - Archivo a subir
 * @param folder - Carpeta de destino (por defecto 'products')
 * @returns URL pública de la imagen o null si hay error
 */
export const uploadImage = async (file: File, folder: string = 'products'): Promise<string | null> => {
  try {
    const authStore = useAuthStore()
    const token = authStore.token

    if (!token) {
      console.error('Usuario no autenticado. No se puede subir imagen.')
      return null
    }

    // Validar archivo
    if (!file || file.size === 0) {
      console.error('Archivo inválido o vacío')
      return null
    }

    // Convertir archivo a base64 usando FileReader (API del navegador)
    const fileBase64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        // Extraer solo la parte base64 (después de "data:image/...;base64,")
        const base64 = result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = () => reject(new Error('Error al leer archivo'))
      reader.readAsDataURL(file)
    })

    // Hacer request al endpoint seguro del backend
    const response = await fetch('/api/admin/upload-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        fileBase64,
        fileName: file.name,
        folder,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Error al subir imagen:', error.error || 'Error desconocido')
      return null
    }

    const data = await response.json()
    return data.publicUrl
  } catch (err) {
    console.error('Error durante la subida:', err)
    return null
  }
}

/**
 * Elimina una imagen del servidor a través de un endpoint seguro
 * @param filePath - Ruta del archivo a eliminar
 * @returns true si se eliminó exitosamente, false en caso contrario
 */
export const deleteImage = async (filePath: string): Promise<boolean> => {
  try {
    const authStore = useAuthStore()
    const token = authStore.token

    if (!token) {
      console.error('Usuario no autenticado. No se puede eliminar imagen.')
      return false
    }

    if (!filePath || typeof filePath !== 'string') {
      console.error('Ruta de archivo inválida')
      return false
    }

    // Hacer request al endpoint seguro del backend
    const response = await fetch('/api/admin/delete-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ filePath }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Error al eliminar imagen:', error.error || 'Error desconocido')
      return false
    }

    return true
  } catch (err) {
    console.error('Error durante la eliminación:', err)
    return false
  }
}

/**
 * Obtiene la URL pública de un archivo sin necesidad de autenticación
 * @param filePath - Ruta del archivo
 * @returns URL pública del archivo
 */
export const getPublicUrl = (filePath: string): string => {
  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath)

  return data.publicUrl
}
