// services/geminiService.ts
// Re-implemented to use Nominatim (OpenStreetMap) so we avoid embedding any API key in the client.
// Exposes the same functions expected by the rest of the app: getCoordinatesForCity, getRegionForCity

import type { Coordinates } from "../types";

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';

export const getCoordinatesForCity = async (cityName: string): Promise<Coordinates> => {
  const q = encodeURIComponent(`${cityName}, Italy`);
  const url = `${NOMINATIM_BASE}/search?format=json&limit=1&q=${q}&addressdetails=1`;
  try {
    const res = await fetch(url, {
      headers: {
        // Nominatim asks for a valid User-Agent/Referer — keep it polite
        'Accept': 'application/json'
      }
    });
    if (!res.ok) {
      throw new Error(`Geocoding request failed: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error(`Nessun risultato per la città: "${cityName}"`);
    }
    const first = data[0];
    return {
      lat: Number(first.lat),
      lon: Number(first.lon)
    };
  } catch (err: any) {
    console.error('Errore in getCoordinatesForCity (Nominatim):', err);
    throw new Error(`Impossibile ottenere le coordinate per "${cityName}".`);
  }
};

export const getRegionForCity = async (cityName: string): Promise<string> => {
  const q = encodeURIComponent(`${cityName}, Italy`);
  const url = `${NOMINATIM_BASE}/search?format=json&limit=1&q=${q}&addressdetails=1`;
  try {
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });
    if (!res.ok) {
      throw new Error(`Region request failed: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error(`Nessun risultato per la città: "${cityName}"`);
    }
    const addr = data[0].address || {};
    // Nominatim può restituire state, region, county. Usiamo la prima disponibile.
    const region = addr.state || addr.region || addr.county || addr.province || '';
    if (!region) {
      throw new Error(`Regione non trovata per "${cityName}".`);
    }
    return region;
  } catch (err: any) {
    console.error('Errore in getRegionForCity (Nominatim):', err);
    throw new Error(`Impossibile ottenere la regione per "${cityName}".`);
  }
};