
import { useState, useEffect } from 'react';
import { ChargingStationData, parseChargingStationsGeoJSON } from '../utils/geoJsonParser';

export const useChargingStations = () => {
  const [stations, setStations] = useState<ChargingStationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStations = async () => {
      try {
        setIsLoading(true);
        
        // Load the GeoJSON file from the public directory
        const response = await fetch('/test.geojson');
        if (!response.ok) {
          throw new Error('Impossible de charger les données des bornes');
        }
        
        const geoJsonContent = await response.text();
        const parsedStations = parseChargingStationsGeoJSON(geoJsonContent);
        
        console.log(`${parsedStations.length} bornes chargées depuis le GeoJSON`);
        setStations(parsedStations);
        setError(null);
      } catch (err) {
        console.error('Erreur lors du chargement des bornes:', err);
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setIsLoading(false);
      }
    };

    loadStations();
  }, []);

  return { stations, isLoading, error };
};
