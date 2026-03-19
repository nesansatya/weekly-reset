const ipRequestMap = new Map<string, { count: number; resetTime: number }>()

export async function checkRequestSize(request: Request, maxKb = 50): Promise<boolean> {
  const contentLength = request.headers.get('content-length')
  if (contentLength && parseInt(contentLength) > maxKb * 1024) return false
  return true
}

const WINDOW_MS = 60 * 1000 // 1 minute
const MAX_REQUESTS = 60 // max 60 requests per minute per IP

export function rateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()
  const record = ipRequestMap.get(ip)

  if (!record || now > record.resetTime) {
    ipRequestMap.set(ip, { count: 1, resetTime: now + WINDOW_MS })
    return { allowed: true }
  }

  if (record.count >= MAX_REQUESTS) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000)
    return { allowed: false, retryAfter }
  }

  record.count++
  return { allowed: true }
}