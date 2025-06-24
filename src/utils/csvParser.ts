
export interface ChargingStationData {
  id: string;
  nom_station: string;
  nom_operateur: string;
  nom_enseigne: string;
  adresse_station: string;
  lat: number;
  lng: number;
  puissance_nominale: number;
  prise_type_2: boolean;
  prise_type_combo_ccs: boolean;
  prise_type_chademo: boolean;
  gratuit: boolean;
  tarification: string;
  horaires: string;
  accessibilite_pmr: string;
  nbre_pdc: number;
}

export const parseChargingStationsCSV = (csvContent: string): ChargingStationData[] => {
  const lines = csvContent.split('\n');
  const headers = lines[0].split(',');
  
  const stations: ChargingStationData[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    
    const values = line.split(',');
    if (values.length < headers.length) continue;
    
    try {
      // Parse coordinates from the coordonneesXY field
      const coordField = values[13] || '';
      const coordMatch = coordField.match(/\[([^,]+),\s*([^\]]+)\]/);
      
      if (!coordMatch) continue;
      
      const lng = parseFloat(coordMatch[1]);
      const lat = parseFloat(coordMatch[2]);
      
      if (isNaN(lat) || isNaN(lng)) continue;
      
      const station: ChargingStationData = {
        id: values[6] || `station-${i}`,
        nom_station: values[9] || 'Station inconnue',
        nom_operateur: values[3] || 'Opérateur inconnu',
        nom_enseigne: values[6] || 'Enseigne inconnue',
        adresse_station: values[11] || 'Adresse inconnue',
        lat,
        lng,
        puissance_nominale: parseInt(values[17]) || 0,
        prise_type_2: values[19] === 'true',
        prise_type_combo_ccs: values[20] === 'true',
        prise_type_chademo: values[21] === 'true',
        gratuit: values[23] === 'true',
        tarification: values[26] || 'Non spécifié',
        horaires: values[29] || 'Non spécifié',
        accessibilite_pmr: values[30] || 'Non spécifié',
        nbre_pdc: parseInt(values[14]) || 1
      };
      
      stations.push(station);
    } catch (error) {
      console.log(`Erreur parsing ligne ${i}:`, error);
      continue;
    }
  }
  
  return stations;
};
