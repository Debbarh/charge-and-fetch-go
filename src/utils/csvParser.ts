
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

// Fonction pour parser une ligne CSV en tenant compte des guillemets
const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Double quote escaping
        current += '"';
        i += 2;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
        i++;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current.trim());
      current = '';
      i++;
    } else {
      current += char;
      i++;
    }
  }
  
  // Add the last field
  result.push(current.trim());
  return result;
};

export const parseChargingStationsCSV = (csvContent: string): ChargingStationData[] => {
  const lines = csvContent.split('\n');
  if (lines.length < 2) {
    console.log('CSV file is too short');
    return [];
  }
  
  const stations: ChargingStationData[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    try {
      const values = parseCSVLine(line);
      
      if (values.length < 45) {
        console.log(`Ligne ${i}: pas assez de colonnes (${values.length})`);
        continue;
      }
      
      // Parse coordinates from the coordonneesXY field (index 13)
      const coordField = values[13] || '';
      const coordMatch = coordField.match(/\[([^,]+),\s*([^\]]+)\]/);
      
      if (!coordMatch) {
        console.log(`Ligne ${i}: coordonnées invalides: ${coordField}`);
        continue;
      }
      
      const lng = parseFloat(coordMatch[1]);
      const lat = parseFloat(coordMatch[2]);
      
      if (isNaN(lat) || isNaN(lng)) {
        console.log(`Ligne ${i}: coordonnées NaN: lat=${lat}, lng=${lng}`);
        continue;
      }
      
      const station: ChargingStationData = {
        id: values[7] || `station-${i}`, // id_station_itinerance
        nom_station: values[9] || 'Station inconnue', // nom_station
        nom_operateur: values[3] || 'Opérateur inconnu', // nom_operateur
        nom_enseigne: values[6] || 'Enseigne inconnue', // nom_enseigne
        adresse_station: values[11] || 'Adresse inconnue', // adresse_station
        lat,
        lng,
        puissance_nominale: parseInt(values[17]) || 0, // puissance_nominale
        prise_type_2: values[19] === 'true', // prise_type_2
        prise_type_combo_ccs: values[20] === 'true', // prise_type_combo_ccs
        prise_type_chademo: values[21] === 'true', // prise_type_chademo
        gratuit: values[23] === 'true', // gratuit
        tarification: values[27] || 'Non spécifié', // tarification
        horaires: values[29] || 'Non spécifié', // horaires
        accessibilite_pmr: values[30] || 'Non spécifié', // accessibilite_pmr
        nbre_pdc: parseInt(values[14]) || 1 // nbre_pdc
      };
      
      stations.push(station);
      
      if (stations.length <= 5) {
        console.log(`Station ${stations.length}:`, {
          nom: station.nom_station,
          coords: `${station.lat}, ${station.lng}`,
          puissance: station.puissance_nominale
        });
      }
      
    } catch (error) {
      console.log(`Erreur parsing ligne ${i}:`, error);
      continue;
    }
  }
  
  console.log(`Total des stations parsées: ${stations.length}`);
  return stations;
};
