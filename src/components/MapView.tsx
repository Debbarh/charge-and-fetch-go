import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Zap, Navigation, Locate } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChargingStations } from '../hooks/useChargingStations';

// Dynamically import leaflet to avoid SSR issues
const MapView = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const userLocationMarkerRef = useRef<any>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  
  const { stations, isLoading, error } = useChargingStations();

  useEffect(() => {
    const loadLeaflet = async () => {
      try {
        const L = await import('leaflet');
        await import('leaflet/dist/leaflet.css');
        
        // Fix for default markers in Leaflet
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        setLeafletLoaded(true);
        return L;
      } catch (error) {
        console.error('Failed to load Leaflet:', error);
        return null;
      }
    };

    const initializeMap = async () => {
      if (!mapRef.current) return;

      const L = await loadLeaflet();
      if (!L) return;

      // Initialize the map centered on France
      const map = L.map(mapRef.current).setView([46.6034, 1.8883], 6);
      mapInstanceRef.current = map;

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);
    };

    initializeMap();

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const addStationsToMap = async () => {
      if (!mapInstanceRef.current || !leafletLoaded || !stations.length) return;

      const L = await import('leaflet');
      
      // Clear existing markers (if any)
      mapInstanceRef.current.eachLayer((layer: any) => {
        if (layer instanceof L.Marker && layer !== userLocationMarkerRef.current) {
          mapInstanceRef.current.removeLayer(layer);
        }
      });

      // Add charging station markers
      stations.forEach((station) => {
        const powerColor = station.puissance_nominale >= 50 ? 'bg-red-500' : 
                          station.puissance_nominale >= 22 ? 'bg-yellow-500' : 'bg-green-500';
        
        const chargingIcon = L.divIcon({
          html: `<div class="w-6 h-6 ${powerColor} rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                   <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                     <path d="M11 2v20c-5.07-.5-9-4.79-9-10s3.93-9.5 9-10zm2.03.03c5.03.5 8.97 4.76 8.97 9.97s-3.94 9.47-8.97 9.97V2.03z"/>
                   </svg>
                 </div>`,
          className: 'charging-station-marker',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const priseTypes = [];
        if (station.prise_type_2) priseTypes.push('Type 2');
        if (station.prise_type_combo_ccs) priseTypes.push('CCS');
        if (station.prise_type_chademo) priseTypes.push('CHAdeMO');

        L.marker([station.lat, station.lng], { icon: chargingIcon })
          .addTo(mapInstanceRef.current)
          .bindPopup(`
            <div class="p-3 max-w-xs">
              <h3 class="font-semibold text-sm mb-1">${station.nom_station}</h3>
              <p class="text-xs text-gray-600 mb-1">
                <strong>Opérateur:</strong> ${station.nom_operateur}
              </p>
              <p class="text-xs text-gray-600 mb-1">
                <strong>Adresse:</strong> ${station.adresse_station}
              </p>
              <p class="text-xs text-gray-600 mb-1">
                <strong>Puissance:</strong> ${station.puissance_nominale} kW
              </p>
              <p class="text-xs text-gray-600 mb-1">
                <strong>Nombre de bornes:</strong> ${station.nbre_pdc}
              </p>
              ${priseTypes.length > 0 ? `<p class="text-xs text-gray-600 mb-1">
                <strong>Types de prise:</strong> ${priseTypes.join(', ')}
              </p>` : ''}
              <p class="text-xs text-gray-600 mb-1">
                <strong>Tarification:</strong> ${station.gratuit ? 'Gratuit' : station.tarification}
              </p>
              <p class="text-xs text-gray-600">
                <strong>Horaires:</strong> ${station.horaires}
              </p>
            </div>
          `);
      });

      console.log(`${stations.length} bornes ajoutées à la carte`);
    };

    addStationsToMap();
  }, [stations, leafletLoaded]);

  const getCurrentLocation = async () => {
    if (!mapInstanceRef.current || !leafletLoaded) return;
    
    setIsLocating(true);
    
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          if (mapInstanceRef.current) {
            // Center map on user location
            mapInstanceRef.current.setView([latitude, longitude], 15);
            
            // Remove existing user location marker
            if (userLocationMarkerRef.current) {
              mapInstanceRef.current.removeLayer(userLocationMarkerRef.current);
            }
            
            // Dynamically import leaflet for user location marker
            const L = await import('leaflet');
            
            // Create user location marker
            const userIcon = L.divIcon({
              html: `<div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse">
                       <div class="absolute inset-0 bg-blue-500 rounded-full animate-ping"></div>
                     </div>`,
              className: 'user-location-marker',
              iconSize: [16, 16],
              iconAnchor: [8, 8]
            });
            
            userLocationMarkerRef.current = L.marker([latitude, longitude], { icon: userIcon })
              .addTo(mapInstanceRef.current)
              .bindPopup('Votre position actuelle');
          }
          
          setIsLocating(false);
        },
        (error) => {
          console.error('Erreur de géolocalisation:', error);
          setIsLocating(false);
          alert('Impossible d\'obtenir votre position. Vérifiez que la géolocalisation est activée.');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {
      setIsLocating(false);
      alert('La géolocalisation n\'est pas supportée par votre navigateur.');
    }
  };

  return (
    <div className="relative">
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          Erreur: {error}
        </div>
      )}
      
      {isLoading && (
        <div className="mb-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded">
          Chargement des bornes de recharge...
        </div>
      )}

      <div ref={mapRef} className="h-64 rounded-lg overflow-hidden border border-gray-200" />

      {/* Map controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <Button 
          size="sm" 
          variant="secondary" 
          className="bg-white/90 backdrop-blur-sm hover:bg-white"
          onClick={getCurrentLocation}
          disabled={isLocating || !leafletLoaded}
        >
          {isLocating ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          ) : (
            <Locate className="h-4 w-4" />
          )}
        </Button>
        <Button size="sm" variant="secondary" className="bg-white/90 backdrop-blur-sm hover:bg-white">
          <Navigation className="h-4 w-4" />
        </Button>
      </div>

      {/* Map legend */}
      <div className="mt-4 flex items-center justify-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-muted-foreground">≤ 22kW</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <span className="text-muted-foreground">22-50kW</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-muted-foreground">≥ 50kW</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-muted-foreground">Votre position</span>
        </div>
      </div>
      
      {stations.length > 0 && (
        <div className="mt-2 text-center text-sm text-muted-foreground">
          {stations.length} bornes de recharge affichées
        </div>
      )}
    </div>
  );
};

export default MapView;
