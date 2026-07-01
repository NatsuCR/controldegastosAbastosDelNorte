import * as FileSystem from 'expo-file-system/legacy';

import { API_BASE_URL, ApiError } from './apiClient';

function limpiarCampos(campos: object) {
  return Object.fromEntries(
    Object.entries(campos)
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => [key, String(value)])
  );
}

function leerBody(body: string) {
  if (!body) return null;
  try {
    return JSON.parse(body);
  } catch {
    return body;
  }
}

function mensajeError(status: number, body: unknown) {
  if (body && typeof body === 'object' && 'error' in body) {
    const error = body.error;
    if (typeof error === 'string') return error;
  }
  return `Error HTTP ${status}`;
}

export async function subirArchivoMultipart(endpoint: string, archivoUri: string, campos: object) {
  try {
    const result = await FileSystem.uploadAsync(`${API_BASE_URL}/api${endpoint}`, archivoUri, {
      fieldName: 'imagenFactura',
      headers: { 'Bypass-Tunnel-Reminder': 'true' },
      httpMethod: 'POST',
      mimeType: 'image/jpeg',
      parameters: limpiarCampos(campos),
      uploadType: FileSystem.FileSystemUploadType.MULTIPART,
    });
    const body = leerBody(result.body);
    if (result.status >= 200 && result.status < 300) return body;
    throw new ApiError(result.status, mensajeError(result.status, body));
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(0, 'No se pudo subir la factura al servidor');
  }
}
