export function formatBytes(bytes: number): string {
  if (!bytes && bytes !== 0) return '';
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);
  return `${value.toFixed(2)} ${sizes[i]}`;
}

export function mimeOrDefault(file: File | null): string {
  if (!file) return 'Desconhecido';
  return file.type || 'application/octet-stream';
}
