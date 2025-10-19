import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { Icon, LatLngExpression } from 'leaflet';
import { Navigation, Clock, MapPin, CheckCircle, Car } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import 'leaflet/dist/leaflet.css';

interface RideTracking {
  id: string;
  request_id: string;
  driver_id: string;
  status: 'waiting' | 'on_the_way' | 'arrived' | 'in_progress' | 'completed' | 'cancelled';
  driver_latitude: number;
  driver_longitude: number;
  pickup_eta_minutes: number;
  destination_eta_minutes: number;
  distance_to_pickup_km: number;
  distance_to_destination_km: number;
}

interface RideTrackerProps {
  requestId: string;
  pickupLat: number;
  pickupLng: number;
  destinationLat?: number;
  destinationLng?: number;
  isDriver?: boolean;
}

const MapUpdater = ({ center }: { center: LatLngExpression }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
};

const RideTracker: React.FC<RideTrackerProps> = ({
  requestId,
  pickupLat,
  pickupLng,
  destinationLat,
  destinationLng,
  isDriver = false
}) => {
  const { user } = useAuth();
  const [tracking, setTracking] = useState<RideTracking | null>(null);
  const [watchId, setWatchId] = useState<number | null>(null);
  const [mapCenter, setMapCenter] = useState<LatLngExpression>([pickupLat, pickupLng]);

  const carIcon = new Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const pickupIcon = new Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const destinationIcon = new Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  useEffect(() => {
    loadTracking();
    subscribeToTracking();

    if (isDriver) {
      startLocationTracking();
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [requestId, isDriver]);

  const loadTracking = async () => {
    try {
      const { data, error } = await supabase
        .from('ride_tracking')
        .select('*')
        .eq('request_id', requestId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setTracking(data as RideTracking);
        if (data.driver_latitude && data.driver_longitude) {
          setMapCenter([data.driver_latitude, data.driver_longitude]);
        }
      }
    } catch (error) {
      console.error('Erreur chargement tracking:', error);
    }
  };

  const subscribeToTracking = () => {
    const channel = supabase
      .channel(`ride-tracking:${requestId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ride_tracking',
          filter: `request_id=eq.${requestId}`
        },
        (payload) => {
          const updatedTracking = payload.new as RideTracking;
          setTracking(updatedTracking);
          
          if (updatedTracking.driver_latitude && updatedTracking.driver_longitude) {
            setMapCenter([updatedTracking.driver_latitude, updatedTracking.driver_longitude]);
          }

          // Send notifications based on status changes
          if (payload.eventType === 'UPDATE') {
            const oldStatus = (payload.old as RideTracking)?.status;
            const newStatus = updatedTracking.status;

            if (oldStatus !== newStatus) {
              switch (newStatus) {
                case 'on_the_way':
                  toast.info('Le chauffeur est en route !');
                  break;
                case 'arrived':
                  toast.success('Le chauffeur est arrivé au point de départ');
                  break;
                case 'in_progress':
                  toast.info('Course en cours');
                  break;
                case 'completed':
                  toast.success('Course terminée !');
                  break;
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const startLocationTracking = () => {
    if (!navigator.geolocation) {
      toast.error('La géolocalisation n\'est pas supportée');
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (position) => {
        updateDriverLocation(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        console.error('Erreur géolocalisation:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );

    setWatchId(id);
  };

  const updateDriverLocation = async (lat: number, lng: number) => {
    if (!user) return;

    try {
      // Calculate distances and ETA (simplified)
      const distanceToPickup = calculateDistance(lat, lng, pickupLat, pickupLng);
      const distanceToDestination = destinationLat && destinationLng 
        ? calculateDistance(lat, lng, destinationLat, destinationLng)
        : null;

      const averageSpeed = 30; // km/h in city
      const pickupEta = Math.ceil((distanceToPickup / averageSpeed) * 60);
      const destinationEta = distanceToDestination 
        ? Math.ceil((distanceToDestination / averageSpeed) * 60)
        : null;

      if (tracking) {
        await supabase
          .from('ride_tracking')
          .update({
            driver_latitude: lat,
            driver_longitude: lng,
            distance_to_pickup_km: distanceToPickup,
            distance_to_destination_km: distanceToDestination,
            pickup_eta_minutes: pickupEta,
            destination_eta_minutes: destinationEta
          })
          .eq('id', tracking.id);
      } else {
        await supabase
          .from('ride_tracking')
          .insert({
            request_id: requestId,
            driver_id: user.id,
            status: 'on_the_way',
            driver_latitude: lat,
            driver_longitude: lng,
            distance_to_pickup_km: distanceToPickup,
            distance_to_destination_km: distanceToDestination,
            pickup_eta_minutes: pickupEta,
            destination_eta_minutes: destinationEta
          });
      }
    } catch (error) {
      console.error('Erreur mise à jour position:', error);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const updateStatus = async (newStatus: RideTracking['status']) => {
    if (!tracking) return;

    try {
      const updates: any = { status: newStatus };

      if (newStatus === 'arrived') {
        updates.arrived_at_pickup = new Date().toISOString();
      } else if (newStatus === 'in_progress') {
        updates.started_at = new Date().toISOString();
      } else if (newStatus === 'completed') {
        updates.completed_at = new Date().toISOString();
        updates.arrived_at_destination = new Date().toISOString();
      }

      await supabase
        .from('ride_tracking')
        .update(updates)
        .eq('id', tracking.id);
    } catch (error) {
      console.error('Erreur mise à jour statut:', error);
      toast.error('Impossible de mettre à jour le statut');
    }
  };

  const getStatusBadge = (status: RideTracking['status']) => {
    const variants: Record<string, { bg: string; text: string; label: string }> = {
      waiting: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'En attente' },
      on_the_way: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'En route' },
      arrived: { bg: 'bg-green-100', text: 'text-green-700', label: 'Arrivé' },
      in_progress: { bg: 'bg-electric-100', text: 'text-electric-700', label: 'En cours' },
      completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Terminé' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Annulé' }
    };

    const variant = variants[status] || variants.waiting;
    return (
      <Badge className={`${variant.bg} ${variant.text}`}>
        {variant.label}
      </Badge>
    );
  };

  const pathCoordinates: LatLngExpression[] = tracking?.driver_latitude && tracking?.driver_longitude
    ? [
        [tracking.driver_latitude, tracking.driver_longitude],
        [pickupLat, pickupLng]
      ]
    : [];

  return (
    <div className="space-y-4">
      {/* Status card */}
      {tracking && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Navigation className="h-5 w-5 text-electric-600" />
                Suivi de course
              </span>
              {getStatusBadge(tracking.status)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Arrivée estimée</p>
                  <p className="font-semibold">{tracking.pickup_eta_minutes || 0} min</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Distance</p>
                  <p className="font-semibold">
                    {tracking.distance_to_pickup_km?.toFixed(1) || 0} km
                  </p>
                </div>
              </div>
            </div>

            {isDriver && tracking.status !== 'completed' && tracking.status !== 'cancelled' && (
              <div className="flex gap-2">
                {tracking.status === 'on_the_way' && (
                  <Button
                    onClick={() => updateStatus('arrived')}
                    className="flex-1 bg-green-500 hover:bg-green-600"
                    size="sm"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Je suis arrivé
                  </Button>
                )}
                {tracking.status === 'arrived' && (
                  <Button
                    onClick={() => updateStatus('in_progress')}
                    className="flex-1 bg-electric-500 hover:bg-electric-600"
                    size="sm"
                  >
                    <Car className="h-4 w-4 mr-1" />
                    Démarrer la course
                  </Button>
                )}
                {tracking.status === 'in_progress' && (
                  <Button
                    onClick={() => updateStatus('completed')}
                    className="flex-1 bg-green-500 hover:bg-green-600"
                    size="sm"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Terminer la course
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Map */}
      <Card>
        <CardContent className="p-0">
          <div className="h-[400px] rounded-lg overflow-hidden">
            <MapContainer
              center={mapCenter}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              <MapUpdater center={mapCenter} />

              {/* Driver marker */}
              {tracking?.driver_latitude && tracking?.driver_longitude && (
                <Marker 
                  position={[tracking.driver_latitude, tracking.driver_longitude]}
                  icon={carIcon}
                >
                  <Popup>
                    <strong>Chauffeur</strong><br />
                    ETA: {tracking.pickup_eta_minutes} min
                  </Popup>
                </Marker>
              )}

              {/* Pickup marker */}
              <Marker position={[pickupLat, pickupLng]} icon={pickupIcon}>
                <Popup>
                  <strong>Point de départ</strong>
                </Popup>
              </Marker>

              {/* Destination marker */}
              {destinationLat && destinationLng && (
                <Marker position={[destinationLat, destinationLng]} icon={destinationIcon}>
                  <Popup>
                    <strong>Destination</strong>
                  </Popup>
                </Marker>
              )}

              {/* Path line */}
              {pathCoordinates.length > 0 && (
                <Polyline
                  positions={pathCoordinates}
                  color="#3b82f6"
                  weight={3}
                  opacity={0.7}
                />
              )}
            </MapContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RideTracker;
