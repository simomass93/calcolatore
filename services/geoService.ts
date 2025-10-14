import { WAREHOUSES } from '../constants';
// Fix: Corrected import paths now that types.ts and geminiService.ts are valid modules.
import type { Coordinates, DistanceResult, Warehouse } from '../types';
import { getCoordinatesForCity } from './geminiService';

// Haversine formula to calculate distance between two lat/lon points
const getDistance = (coord1: Coordinates, coord2: Coordinates): number => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (coord2.lat - coord1.lat) * (Math.PI / 180);
  const dLon = (coord2.lon - coord1.lon) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(coord1.lat * (Math.PI / 180)) *
      Math.cos(coord2.lat * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const findClosestWarehouse = async (destinationCity: string): Promise<DistanceResult> => {
  const normalizedCity = destinationCity.trim().toLowerCase();
  
  // Controlla prima se la destinazione è una delle città magazzino
  const warehouseCity = WAREHOUSES.find(w => w.name.toLowerCase() === normalizedCity);
  if (warehouseCity) {
    return { warehouse: warehouseCity, distance: 0 };
  }
  
  // Ottieni le coordinate della città tramite Gemini API
  const cityLocation = await getCoordinatesForCity(destinationCity);

  let closestWarehouse: Warehouse | null = null;
  let minDistance = Infinity;

  WAREHOUSES.forEach(warehouse => {
    const distance = getDistance(cityLocation, warehouse.location);
    if (distance < minDistance) {
      minDistance = distance;
      closestWarehouse = warehouse;
    }
  });

  if (closestWarehouse) {
    return { warehouse: closestWarehouse, distance: Math.round(minDistance) };
  } else {
    // Questo caso non dovrebbe essere raggiungibile se WAREHOUSES non è vuoto
    throw new Error(`Errore nel calcolo della distanza per "${destinationCity}".`);
  }
};
