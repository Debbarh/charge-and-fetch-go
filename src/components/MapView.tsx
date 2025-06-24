
import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Zap, Navigation, Locate } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Dynamically import leaflet to avoid SSR issues
const MapView = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const userLocationMarkerRef = useRef<any>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  const chargingStations = [
    { id: 1, lat: 48.8566, lng: 2.3522, name: 'Tesla Supercharger', available: 4, total: 8 },
    { id: 2, lat: 48.8606, lng: 2.3376, name: 'Ionity', available: 2, total: 6 },
    { id: 3, lat: 48.8534, lng: 2.3488, name: 'ChargePoint', available: 6, total: 10 },
  ];

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

      // Initialize the map
      const map = L.map(mapRef.current).setView([48.8566, 2.3522], 13);
      mapInstanceRef.current = map;

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      // Add charging station markers
      chargingStations.forEach((station) => {
        const chargingIcon = L.divIcon({
          html: `<div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                   <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                     <path d="M11 2v20c-5.07-.5-9-4.79-9-10s3.93-9.5 9-10zm2.03.03c5.03.5 8.97 4.76 8.97 9.97s-3.94 9.47-8.97 9.97V2.03z"/>
                   </svg>
                 </div>`,
          className: 'charging-station-marker',
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        L.marker([station.lat, station.lng], { icon: chargingIcon })
          .addTo(map)
          .bindPopup(`
            <div class="p-2">
              <h3 class="font-semibold">${station.name}</h3>
              <p class="text-sm text-gray-600">${station.available}/${station.total} bornes disponibles</p>
            </div>
          `);
      });
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
          <span className="text-muted-foreground">Bornes disponibles</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-muted-foreground">Votre position</span>
        </div>
      </div>
    </div>
  );
};

export default MapView;
