export function sanitizeString(input: string, maxLength = 100): string {
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>'"]/g, '') // strip HTML/script injection chars
}

export function sanitizeName(name: string): string {
  return sanitizeString(name, 50)
    .replace(/[^a-zA-Z0-9\s\-'.]/g, '') // only allow safe name characters
}