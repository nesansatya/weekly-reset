const REQUIRED_SERVER_VARS = [
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'SUPABASE_SERVICE_ROLE_KEY',
]

const DANGEROUS_PUBLIC_VARS = [
  'NEXT_PUBLIC_STRIPE_SECRET_KEY',
  'NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_STRIPE_WEBHOOK_SECRET',
]

export function checkEnvVars() {
  // Check required server vars exist
  const missing = REQUIRED_SERVER_VARS.filter(v => !process.env[v])
  if (missing.length > 0) {
    console.error(`Missing required env vars: ${missing.join(', ')}`)
  }

  // Check no secret vars are accidentally public
  const exposed = DANGEROUS_PUBLIC_VARS.filter(v => process.env[v])
  if (exposed.length > 0) {
    throw new Error(`SECURITY: Secret keys exposed publicly: ${exposed.join(', ')}`)
  }
}