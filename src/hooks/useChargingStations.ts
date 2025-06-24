
import { useState, useEffect } from 'react';
import { ChargingStationData, parseChargingStationsCSV } from '../utils/csvParser';

export const useChargingStations = () => {
  const [stations, setStations] = useState<ChargingStationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStations = async () => {
      try {
        setIsLoading(true);
        
        // Load the CSV file from the public directory
        const response = await fetch('/consolidation-etalab-schema-irve-statique-v-2.3.1-20250624.csv');
        if (!response.ok) {
          throw new Error('Impossible de charger les données des bornes');
        }
        
        const csvContent = await response.text();
        const parsedStations = parseChargingStationsCSV(csvContent);
        
        console.log(`${parsedStations.length} bornes chargées depuis le CSV`);
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
