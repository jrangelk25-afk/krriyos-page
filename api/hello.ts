import type { ApiRequest, ApiResponse } from './types'

export default async function handler(
  req: ApiRequest,
  res: ApiResponse
) {
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({
    message: 'API está funcionando correctamente',
    timestamp: new Date().toISOString(),
  }))
}
