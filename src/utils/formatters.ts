/**
 * Format a Date or ISO timestamp into a clean 24h operational time string (HH:mm:ss)
 */
export function formatTime(date: Date | string | number): string {
  const d = new Date(date);
  return d.toLocaleTimeString('en-GB', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Format date for telemetry display (e.g., "08 OCT 2026")
 */
export function formatTelemetryDate(date: Date | string | number): string {
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, '0');
  const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

/**
 * Format full date and time (e.g., "2026-10-08 14:32:05 UTC+1")
 */
export function formatFullTimestamp(date: Date | string | number): string {
  const d = new Date(date);
  const dateStr = d.toISOString().slice(0, 10);
  const timeStr = formatTime(d);
  return `${dateStr} ${timeStr}`;
}

/**
 * Clean and normalize scanned QR code strings
 */
export function normalizeQRCode(raw: string): string {
  return raw.trim().toUpperCase();
}
