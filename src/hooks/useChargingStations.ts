
import { useState, useEffect, useMemo } from 'react';
import { ChargingStationData, parseChargingStationsGeoJSON } from '../utils/geoJsonParser';
import { calculateDistance } from '../utils/geoUtils';
import { UserLocation } from './useUserLocation';

export const useChargingStations = (userLocation?: UserLocation | null) => {
  const [allStations, setAllStations] = useState<ChargingStationData[]>([]);
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
        setAllStations(parsedStations);
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

  // Calculer les distances et trier les stations
  const stations = useMemo(() => {
    if (!userLocation || allStations.length === 0) {
      return allStations;
    }

    const stationsWithDistance = allStations.map(station => ({
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
    
    console.log('Distances calculées pour', stationsWithDistance.length, 'bornes');
    return stationsWithDistance;
  }, [userLocation, allStations]);

  return { stations, isLoading, error };
};
