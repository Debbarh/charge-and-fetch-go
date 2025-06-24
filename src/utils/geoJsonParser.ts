
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

export const parseChargingStationsGeoJSON = (geoJsonContent: string): ChargingStationData[] => {
  try {
    const geoData = JSON.parse(geoJsonContent);
    
    if (!geoData.features || !Array.isArray(geoData.features)) {
      console.error('Format GeoJSON invalide: pas de features');
      return [];
    }
    
    const stations: ChargingStationData[] = [];
    
    geoData.features.forEach((feature: any, index: number) => {
      try {
        if (!feature.geometry || !feature.geometry.coordinates || !feature.properties) {
          console.log(`Feature ${index}: géométrie ou propriétés manquantes`);
          return;
        }
        
        const [lng, lat] = feature.geometry.coordinates;
        const props = feature.properties;
        
        if (isNaN(lat) || isNaN(lng)) {
          console.log(`Feature ${index}: coordonnées invalides: lat=${lat}, lng=${lng}`);
          return;
        }
        
        const station: ChargingStationData = {
          id: props.id_station_itinerance || `station-${index}`,
          nom_station: props.nom_station || 'Station inconnue',
          nom_operateur: props.nom_operateur || 'Opérateur inconnu',
          nom_enseigne: props.nom_enseigne || 'Enseigne inconnue',
          adresse_station: props.adresse_station || 'Adresse inconnue',
          lat,
          lng,
          puissance_nominale: parseInt(props.puissance_nominale) || 0,
          prise_type_2: props.prise_type_2 === 'true' || props.prise_type_2 === true,
          prise_type_combo_ccs: props.prise_type_combo_ccs === 'true' || props.prise_type_combo_ccs === true,
          prise_type_chademo: props.prise_type_chademo === 'true' || props.prise_type_chademo === true,
          gratuit: props.gratuit === 'true' || props.gratuit === true,
          tarification: props.tarification || 'Non spécifié',
          horaires: props.horaires || 'Non spécifié',
          accessibilite_pmr: props.accessibilite_pmr || 'Non spécifié',
          nbre_pdc: parseInt(props.nbre_pdc) || 1
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
        console.log(`Erreur parsing feature ${index}:`, error);
      }
    });
    
    console.log(`Total des stations parsées depuis GeoJSON: ${stations.length}`);
    return stations;
    
  } catch (error) {
    console.error('Erreur parsing GeoJSON:', error);
    return [];
  }
};
