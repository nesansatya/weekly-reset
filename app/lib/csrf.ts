const ALLOWED_ORIGINS = [
  'https://weekly-reset.vercel.app',
  'http://localhost:3000',
]

export function checkOrigin(request: Request): boolean {
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')

  // Allow capacitor (Android APK) requests
  if (!origin && !referer) return true
  if (origin === 'capacitor://localhost') return true
  if (origin === 'http://localhost') return true

  if (origin && ALLOWED_ORIGINS.some(o => origin.startsWith(o))) return true
  if (referer && ALLOWED_ORIGINS.some(o => referer.startsWith(o))) return true

  return false
}