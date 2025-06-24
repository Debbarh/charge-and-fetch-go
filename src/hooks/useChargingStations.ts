
import { useState, useEffect } from 'react';
import { ChargingStationData, parseChargingStationsGeoJSON } from '../utils/geoJsonParser';
import { calculateDistance } from '../utils/geoUtils';
import { UserLocation } from './useUserLocation';

export const useChargingStations = (userLocation?: UserLocation | null) => {
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

  // Calculer les distances quand la position de l'utilisateur change
  useEffect(() => {
    if (userLocation && stations.length > 0) {
      const stationsWithDistance = stations.map(station => ({
        ...station,
        distance: calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          station.lat,
          station.lng
        )
      }));

      // Trier par distance croissante
      stationsWithDistance.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      
      setStations(stationsWithDistance);
      console.log('Distances calculées pour', stationsWithDistance.length, 'bornes');
    }
  }, [userLocation, stations.length]);

  return { stations, isLoading, error };
};
