/**
 * Shared utility functions for contract formatting and display
 */

export function formatContractType(
  contractType: string,
  labels: Record<string, string>,
  barrier?: string
): string {
  const label = labels[contractType] ?? contractType;
  return barrier !== undefined ? `${label} (${barrier})` : label;
}

export function getDirectionDisplay(
  contractType: string,
  labels: Record<string, string>
): { label: string } {
  const label = labels[contractType] ?? contractType;
  return { label };
}

export function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  
  if (h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }
  
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}
