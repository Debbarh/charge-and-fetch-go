
import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Zap, Navigation, Locate, X, Route } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChargingStations } from '../hooks/useChargingStations';
import { useUserLocation } from '../hooks/useUserLocation';

// Dynamically import leaflet to avoid SSR issues
const MapView = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const userLocationMarkerRef = useRef<any>(null);
  const routeLayerRef = useRef<any>(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [selectedStation, setSelectedStation] = useState<any>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  
  const { stations, isLoading, error } = useChargingStations();
  const { userLocation, isLocating, locationError } = useUserLocation();

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

      // Initialize the map centered on France with custom styling
      const map = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([46.6034, 1.8883], 6);
      mapInstanceRef.current = map;

      // Add custom zoom control
      L.control.zoom({
        position: 'bottomleft'
      }).addTo(map);

      // Add attribution control in bottom right
      L.control.attribution({
        position: 'bottomright',
        prefix: false
      }).addTo(map);

      // Use CartoDB Positron tiles for a cleaner, more modern look
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap © CartoDB',
        subdomains: 'abcd',
        maxZoom: 19
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

  // Function to get route from OSRM
  const getRoute = async (start: [number, number], end: [number, number]) => {
    try {
      setIsLoadingRoute(true);
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`
      );
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        return data.routes[0];
      }
      return null;
    } catch (error) {
      console.error('Erreur lors du calcul de l\'itinéraire:', error);
      return null;
    } finally {
      setIsLoadingRoute(false);
    }
  };

  // Function to display route on map
  const displayRoute = async (station: any) => {
    if (!mapInstanceRef.current || !leafletLoaded || !userLocation) return;

    const L = await import('leaflet');
    
    // Remove existing route
    if (routeLayerRef.current) {
      mapInstanceRef.current.removeLayer(routeLayerRef.current);
    }

    const route = await getRoute(
      [userLocation.latitude, userLocation.longitude],
      [station.lat, station.lng]
    );

    if (route && route.geometry) {
      // Create route line with modern styling
      routeLayerRef.current = L.geoJSON(route.geometry, {
        style: {
          color: '#22c55e',
          weight: 5,
          opacity: 0.8,
          dashArray: '10, 5',
          lineCap: 'round',
          lineJoin: 'round'
        }
      }).addTo(mapInstanceRef.current);

      // Fit map to show the route with nice padding
      mapInstanceRef.current.fitBounds(routeLayerRef.current.getBounds(), {
        padding: [30, 30]
      });

      setSelectedStation(station);
      console.log('Itinéraire affiché vers:', station.nom_station);
    }
  };

  // Function to clear route
  const clearRoute = async () => {
    if (!mapInstanceRef.current || !routeLayerRef.current) return;

    mapInstanceRef.current.removeLayer(routeLayerRef.current);
    routeLayerRef.current = null;
    setSelectedStation(null);
    
    // Return to user location view
    if (userLocation) {
      mapInstanceRef.current.setView([userLocation.latitude, userLocation.longitude], 12);
    }
  };

  // Function to open navigation app
  const openNavigation = () => {
    if (!selectedStation || !userLocation) return;
    
    const { lat, lng } = selectedStation;
    const destination = `${lat},${lng}`;
    const origin = `${userLocation.latitude},${userLocation.longitude}`;
    
    // Try to detect the platform and open the appropriate navigation app
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    if (isIOS) {
      // For iOS, try Apple Maps first, then Google Maps
      const appleMapsUrl = `maps://maps.apple.com/?daddr=${destination}&saddr=${origin}&dirflg=d`;
      window.open(appleMapsUrl);
    } else if (isAndroid) {
      // For Android, try Google Maps
      const googleMapsUrl = `google.navigation:q=${destination}&mode=d`;
      window.open(googleMapsUrl);
    } else {
      // For web browsers, open Google Maps in a new tab
      const webMapsUrl = `https://www.google.com/maps/dir/${origin}/${destination}`;
      window.open(webMapsUrl, '_blank');
    }
    
    console.log('Navigation ouverte vers:', selectedStation.nom_station);
  };

  // Update user location marker when position changes
  useEffect(() => {
    const updateUserLocationMarker = async () => {
      if (!mapInstanceRef.current || !leafletLoaded || !userLocation) return;

      const L = await import('leaflet');
      
      // Remove existing user location marker
      if (userLocationMarkerRef.current) {
        mapInstanceRef.current.removeLayer(userLocationMarkerRef.current);
      }
      
      // Create modern user location marker
      const userIcon = L.divIcon({
        html: `<div class="relative w-8 h-8">
                 <div class="absolute inset-0 bg-electric-500 rounded-full border-4 border-white shadow-xl animate-pulse"></div>
                 <div class="absolute inset-2 bg-electric-600 rounded-full"></div>
                 <div class="absolute -inset-2 bg-electric-400 rounded-full animate-ping opacity-20"></div>
               </div>`,
        className: 'user-location-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });
      
      userLocationMarkerRef.current = L.marker([userLocation.latitude, userLocation.longitude], { 
        icon: userIcon,
        zIndexOffset: 1000
      })
        .addTo(mapInstanceRef.current)
        .bindPopup(`
          <div class="p-3 bg-gradient-to-r from-electric-50 to-blue-50 rounded-lg">
            <h3 class="font-semibold text-sm mb-2 text-electric-800">📍 Votre position</h3>
            <p class="text-xs text-electric-600">
              <strong>Latitude:</strong> ${userLocation.latitude.toFixed(6)}
            </p>
            <p class="text-xs text-electric-600">
              <strong>Longitude:</strong> ${userLocation.longitude.toFixed(6)}
            </p>
          </div>
        `);
      
      // Center the map on user location with appropriate zoom
      if (!selectedStation) {
        mapInstanceRef.current.setView([userLocation.latitude, userLocation.longitude], 12);
      }
      
      console.log('Marqueur utilisateur ajouté à la position:', userLocation.latitude, userLocation.longitude);
    };

    updateUserLocationMarker();
  }, [userLocation, leafletLoaded]);

  useEffect(() => {
    const addStationsToMap = async () => {
      if (!mapInstanceRef.current || !leafletLoaded || !stations.length) return;

      const L = await import('leaflet');
      
      // Clear existing charging station markers (keep user location marker)
      mapInstanceRef.current.eachLayer((layer: any) => {
        if (layer instanceof L.Marker && 
            layer !== userLocationMarkerRef.current) {
          mapInstanceRef.current.removeLayer(layer);
        }
      });

      // Add charging station markers with modern design
      stations.forEach((station) => {
        const powerColor = station.puissance_nominale >= 50 ? 'bg-red-500' : 
                          station.puissance_nominale >= 22 ? 'bg-yellow-500' : 'bg-green-500';
        
        const chargingIcon = L.divIcon({
          html: `<div class="relative group cursor-pointer">
                   <div class="w-8 h-8 ${powerColor} rounded-full flex items-center justify-center shadow-lg border-3 border-white hover:scale-110 transition-all duration-200 hover:shadow-xl">
                     <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                       <path d="M11 2v20c-5.07-.5-9-4.79-9-10s3.93-9.5 9-10zm2.03.03c5.03.5 8.97 4.76 8.97 9.97s-3.94 9.47-8.97 9.97V2.03z"/>
                     </svg>
                   </div>
                   <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 ${powerColor} rotate-45 opacity-80"></div>
                 </div>`,
          className: 'charging-station-marker',
          iconSize: [32, 40],
          iconAnchor: [16, 36]
        });

        const priseTypes = [];
        if (station.prise_type_2) priseTypes.push('Type 2');
        if (station.prise_type_combo_ccs) priseTypes.push('CCS');
        if (station.prise_type_chademo) priseTypes.push('CHAdeMO');

        const distanceText = station.distance ? ` • ${station.distance < 1 ? Math.round(station.distance * 1000) + ' m' : station.distance + ' km'}` : '';

        const marker = L.marker([station.lat, station.lng], { icon: chargingIcon })
          .addTo(mapInstanceRef.current);

        // Add click event to show route
        marker.on('click', () => {
          if (userLocation) {
            displayRoute(station);
          } else {
            alert('Position utilisateur non disponible pour calculer l\'itinéraire');
          }
        });

        marker.bindPopup(`
          <div class="p-4 max-w-xs bg-gradient-to-br from-white to-electric-50 rounded-lg">
            <div class="flex items-center gap-2 mb-3">
              <div class="w-3 h-3 ${powerColor} rounded-full"></div>
              <h3 class="font-semibold text-sm text-electric-800">${station.nom_station}</h3>
            </div>
            <div class="space-y-2 text-xs">
              <p class="text-electric-600">
                <strong>🏢 Opérateur:</strong> ${station.nom_operateur}
              </p>
              <p class="text-electric-600">
                <strong>📍 Adresse:</strong> ${station.adresse_station}
              </p>
              ${station.distance ? `<p class="text-blue-600">
                <strong>📏 Distance:</strong>${distanceText}
              </p>` : ''}
              <p class="text-electric-600">
                <strong>⚡ Puissance:</strong> ${station.puissance_nominale} kW
              </p>
              <p class="text-electric-600">
                <strong>🔌 Bornes:</strong> ${station.nbre_pdc}
              </p>
              ${priseTypes.length > 0 ? `<p class="text-electric-600">
                <strong>🔧 Types:</strong> ${priseTypes.join(', ')}
              </p>` : ''}
              <p class="text-electric-600">
                <strong>💰 Tarif:</strong> ${station.gratuit ? '✅ Gratuit' : station.tarification}
              </p>
              <p class="text-electric-600 mb-3">
                <strong>🕒 Horaires:</strong> ${station.horaires}
              </p>
            </div>
            ${userLocation ? `<button onclick="window.showRoute && window.showRoute(${station.lat}, ${station.lng})" 
              class="w-full bg-gradient-to-r from-electric-500 to-green-500 text-white px-3 py-2 rounded-lg text-xs font-medium hover:from-electric-600 hover:to-green-600 transition-all duration-200 shadow-md hover:shadow-lg">
              🗺️ Voir l'itinéraire
            </button>` : ''}
          </div>
        `);
      });

      // Make displayRoute function available globally for popup buttons
      (window as any).showRoute = (lat: number, lng: number) => {
        const station = stations.find(s => s.lat === lat && s.lng === lng);
        if (station) {
          displayRoute(station);
        }
      };

      console.log(`${stations.length} bornes ajoutées à la carte`);
    };

    addStationsToMap();
  }, [stations, leafletLoaded, userLocation]);

  const getCurrentLocation = async () => {
    if (!mapInstanceRef.current || !leafletLoaded) return;
    
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          if (mapInstanceRef.current) {
            // Center map on user location
            mapInstanceRef.current.setView([latitude, longitude], 15);
          }
        },
        (error) => {
          console.error('Erreur de géolocalisation:', error);
          alert('Impossible d\'obtenir votre position. Vérifiez que la géolocalisation est activée.');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {
      alert('La géolocalisation n\'est pas supportée par votre navigateur.');
    }
  };

  return (
    <div className="relative">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg shadow-sm">
          ❌ Erreur: {error}
        </div>
      )}
      
      {isLoading && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg shadow-sm">
          ⏳ Chargement des bornes de recharge...
        </div>
      )}

      {isLoadingRoute && (
        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 text-orange-700 rounded-lg shadow-sm">
          🗺️ Calcul de l'itinéraire en cours...
        </div>
      )}

      {selectedStation && (
        <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-electric-50 border border-green-200 text-green-700 rounded-lg shadow-md flex justify-between items-center">
          <div>
            <p className="font-medium">🎯 Itinéraire vers:</p>
            <p className="text-sm">{selectedStation.nom_station}</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="default" onClick={openNavigation} className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md">
              <Route className="h-4 w-4 mr-1" />
              Y aller
            </Button>
            <Button size="sm" variant="ghost" onClick={clearRoute} className="hover:bg-red-50">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <div 
        ref={mapRef} 
        className="h-80 rounded-xl overflow-hidden border-2 border-electric-200 shadow-lg bg-gradient-to-br from-electric-50 to-blue-50" 
        style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #eff6ff 100%)'
        }}
      />

      {/* Map controls with modern design */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-3">
        <Button 
          size="sm" 
          variant="secondary" 
          className="bg-white/95 backdrop-blur-md hover:bg-white shadow-lg border border-electric-200 w-12 h-12 rounded-full"
          onClick={getCurrentLocation}
          disabled={isLocating || !leafletLoaded}
        >
          {isLocating ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-electric-600"></div>
          ) : (
            <Locate className="h-5 w-5 text-electric-600" />
          )}
        </Button>
        {selectedStation && (
          <Button 
            size="sm" 
            variant="secondary" 
            className="bg-white/95 backdrop-blur-md hover:bg-white shadow-lg border border-red-200 w-12 h-12 rounded-full"
            onClick={clearRoute}
          >
            <X className="h-5 w-5 text-red-500" />
          </Button>
        )}
      </div>

      {/* Enhanced map legend */}
      <div className="mt-6 bg-gradient-to-r from-white to-electric-50 p-4 rounded-xl border border-electric-200 shadow-sm">
        <h4 className="text-sm font-semibold text-electric-800 mb-3">🗺️ Légende de la carte</h4>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full shadow-sm"></div>
            <span className="text-muted-foreground">≤ 22kW</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded-full shadow-sm"></div>
            <span className="text-muted-foreground">22-50kW</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full shadow-sm"></div>
            <span className="text-muted-foreground">≥ 50kW</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-electric-500 rounded-full animate-pulse shadow-sm"></div>
            <span className="text-muted-foreground">Votre position</span>
          </div>
        </div>
      </div>
      
      {stations.length > 0 && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-electric-50 to-blue-50 px-4 py-2 rounded-full border border-electric-200">
            <Zap className="h-4 w-4 text-electric-500" />
            <span className="text-sm text-electric-700 font-medium">
              {stations.length} bornes disponibles
            </span>
            {userLocation && (
              <>
                <span className="text-electric-400">•</span>
                <span className="text-sm text-electric-600">📍 Position détectée</span>
              </>
            )}
          </div>
          {!selectedStation && (
            <p className="text-xs text-muted-foreground mt-2">
              Cliquez sur une borne pour voir l'itinéraire
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default MapView;
