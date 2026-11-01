// src/renderer/utils.js

export function resolveMedia(pathOrUrl) {
  if (!pathOrUrl || typeof pathOrUrl !== 'string') return null;
  const trimmed = pathOrUrl.trim();
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('forgepoint-media://')
  ) {
    return trimmed;
  }
  // Se for caminho local absoluto
  return `forgepoint-media://${trimmed}`;
}
