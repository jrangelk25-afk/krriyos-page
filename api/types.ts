import type { IncomingMessage, ServerResponse } from 'http'

export type ApiRequest = IncomingMessage & {
  body?: any
  query?: Record<string, string | string[]>
}

export type ApiResponse = ServerResponse & {
  json?: (data: any) => void
}
