
import { useState, useEffect, useMemo } from 'react';
import { ChargingStationData, parseChargingStationsGeoJSON } from '../utils/geoJsonParser';
import { calculateDistance } from '../utils/geoUtils';
import { UserLocation } from './useUserLocation';

interface FilterOptions {
  powerFilter: string[];
  connectorFilter: string[];
  freeOnly: boolean;
  maxDistance: number;
}

export const useChargingStations = (userLocation?: UserLocation | null, filters?: FilterOptions) => {
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

  // Calculer les distances et appliquer les filtres
  const stations = useMemo(() => {
    if (!userLocation || allStations.length === 0) {
      return allStations.slice(0, 10); // Limiter à 10 si pas de position
    }

    // Calculer les distances pour toutes les bornes
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

    // Vérifier si des filtres sont actifs
    const hasActiveFilters = filters && (
      filters.powerFilter.length > 0 || 
      filters.connectorFilter.length > 0 || 
      filters.freeOnly || 
      filters.maxDistance < 50
    );

    // Si aucun filtre actif, retourner les 10 plus proches
    if (!hasActiveFilters) {
      console.log('Aucun filtre actif - affichage des 10 bornes les plus proches');
      return stationsWithDistance.slice(0, 10);
    }

    // Appliquer les filtres
    let filtered = stationsWithDistance;

    // Filtre par distance maximale
    if (filters.maxDistance > 0 && filters.maxDistance < 50) {
      filtered = filtered.filter(station => 
        !station.distance || station.distance <= filters.maxDistance
      );
    }

    // Filtre par puissance
    if (filters.powerFilter.length > 0) {
      filtered = filtered.filter(station => {
        const power = station.puissance_nominale;
        return filters.powerFilter.some(filter => {
          switch(filter) {
            case 'slow': return power <= 22;
            case 'fast': return power > 22 && power < 50;
            case 'rapid': return power >= 50;
            default: return true;
          }
        });
      });
    }

    // Filtre par type de connecteur
    if (filters.connectorFilter.length > 0) {
      filtered = filtered.filter(station => {
        return filters.connectorFilter.some(connector => {
          switch(connector) {
            case 'type2': return station.prise_type_2;
            case 'ccs': return station.prise_type_combo_ccs;
            case 'chademo': return station.prise_type_chademo;
            default: return true;
          }
        });
      });
    }

    // Filtre gratuit uniquement
    if (filters.freeOnly) {
      filtered = filtered.filter(station => station.gratuit);
    }

    console.log('Filtres appliqués:', filtered.length, 'bornes trouvées');
    return filtered.slice(0, 20); // Limiter à 20 résultats filtrés
  }, [userLocation, allStations, filters]);

  return { stations, isLoading, error };
};
