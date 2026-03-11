// ─── API Key Helpers ───
// Per-member API key stored in localStorage. Never sent to our servers —
// only used to authenticate directly with Anthropic.

function storageKey(memberId: string): string {
  return `frequency-ai-apikey-${memberId}`;
}

export function getApiKey(memberId: string): string | null {
  try {
    return localStorage.getItem(storageKey(memberId)) || null;
  } catch {
    return null;
  }
}

export function saveApiKey(memberId: string, key: string): void {
  try {
    localStorage.setItem(storageKey(memberId), key.trim());
  } catch { /* quota */ }
}

export function removeApiKey(memberId: string): void {
  try {
    localStorage.removeItem(storageKey(memberId));
  } catch { /* ignore */ }
}

export function hasApiKey(memberId: string): boolean {
  return !!getApiKey(memberId);
}

export function maskApiKey(key: string): string {
  if (key.length <= 12) return '••••••••';
  return `${key.slice(0, 10)}••••${key.slice(-4)}`;
}

export function isValidApiKey(key: string): boolean {
  const trimmed = key.trim();
  return trimmed.startsWith('sk-ant-') && trimmed.length > 20;
}
