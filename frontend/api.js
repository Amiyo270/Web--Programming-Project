const LOCAL_API_URL = 'http://localhost:5000';

export function getApiUrl() {
  let raw = '';
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) {
      raw = import.meta.env.VITE_API_URL;
    } else if (typeof process !== 'undefined' && process.env && process.env.VITE_API_URL) {
      raw = process.env.VITE_API_URL;
    }
  } catch (e) {}

  const trimmed = (raw || LOCAL_API_URL).trim().replace(/\/+$/, '');

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.includes('.') && !trimmed.startsWith('/')) {
    return `https://${trimmed}`;
  }

  return trimmed || LOCAL_API_URL;
}
