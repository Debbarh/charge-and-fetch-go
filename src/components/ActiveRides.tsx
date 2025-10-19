import React, { useEffect, useState } from 'react';
import { Car, MapPin, Clock, DollarSign, Navigation, Phone, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import RideTracker from './RideTracker';

interface ActiveRide {
  id: string;
  request_id: string;
  customer_name: string;
  customer_phone: string;
  pickup_address: string;
  destination_address: string;
  vehicle_model: string;
  proposed_price: number;
  status: string;
  created_at: string;
  pickup_lat: number;
  pickup_lng: number;
  destination_lat: number | null;
  destination_lng: number | null;
}

const ActiveRides = () => {
  const { user } = useAuth();
  const [activeRides, setActiveRides] = useState<ActiveRide[]>([]);
  const [selectedRide, setSelectedRide] = useState<ActiveRide | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadActiveRides();
      subscribeToRides();
    }
  }, [user]);

  const loadActiveRides = async () => {
    if (!user) return;

    try {
      // Récupérer les offres acceptées du chauffeur
      const { data: offers, error: offersError } = await supabase
        .from('driver_offers')
        .select(`
          id,
          request_id,
          proposed_price,
          status,
          created_at,
          requests!inner (
            id,
            user_id,
            pickup_address,
            destination_address,
            vehicle_model,
            status,
            contact_phone,
            profiles!inner (
              full_name
            )
          )
        `)
        .eq('driver_id', user.id)
        .in('status', ['accepted']);

      if (offersError) throw offersError;

      if (offers) {
        const rides: ActiveRide[] = offers
          .filter(offer => offer.requests && offer.requests.status === 'driver_selected')
          .map(offer => ({
            id: offer.id,
            request_id: offer.request_id,
            customer_name: (offer.requests as any).profiles?.full_name || 'Client',
            customer_phone: (offer.requests as any).contact_phone || '',
            pickup_address: (offer.requests as any).pickup_address || '',
            destination_address: (offer.requests as any).destination_address || '',
            vehicle_model: (offer.requests as any).vehicle_model || '',
            proposed_price: parseFloat(offer.proposed_price.toString()),
            status: offer.status,
            created_at: offer.created_at,
            pickup_lat: 48.8566, // Mock coordinates - à remplacer par les vraies coordonnées
            pickup_lng: 2.3522,
            destination_lat: null,
            destination_lng: null
          }));

        setActiveRides(rides);
        
        // Sélectionner automatiquement la première course si aucune n'est sélectionnée
        if (rides.length > 0 && !selectedRide) {
          setSelectedRide(rides[0]);
        }
      }
    } catch (error) {
      console.error('Erreur chargement courses actives:', error);
      toast.error('Impossible de charger les courses actives');
    } finally {
      setLoading(false);
    }
  };

  const subscribeToRides = () => {
    if (!user) return;

    const channel = supabase
      .channel('active-rides')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'driver_offers',
          filter: `driver_id=eq.${user.id}`
        },
        () => {
          loadActiveRides();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const completeRide = async (rideId: string) => {
    try {
      // Mettre à jour le statut de l'offre
      const { error: offerError } = await supabase
        .from('driver_offers')
        .update({ status: 'completed' })
        .eq('id', rideId);

      if (offerError) throw offerError;

      // Mettre à jour le statut de la requête
      const ride = activeRides.find(r => r.id === rideId);
      if (ride) {
        const { error: requestError } = await supabase
          .from('requests')
          .update({ status: 'completed' })
          .eq('id', ride.request_id);

        if (requestError) throw requestError;

        // Créer une transaction de paiement
        const { error: transactionError } = await supabase
          .from('transactions')
          .insert({
            request_id: ride.request_id,
            offer_id: rideId,
            driver_id: user?.id,
            client_id: user?.id, // À récupérer depuis la requête
            amount: ride.proposed_price,
            payment_method: 'cash',
            payment_status: 'pending',
            transaction_type: 'service',
            description: `Service valet - ${ride.vehicle_model}`
          });

        if (transactionError) throw transactionError;
      }

      toast.success('Course terminée avec succès !', {
        description: 'Le paiement sera traité automatiquement'
      });

      loadActiveRides();
    } catch (error) {
      console.error('Erreur fin de course:', error);
      toast.error('Impossible de terminer la course');
    }
  };

  const callCustomer = (phone: string) => {
    if (phone) {
      window.location.href = `tel:${phone}`;
    } else {
      toast.error('Numéro de téléphone non disponible');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Chargement des courses actives...</p>
        </CardContent>
      </Card>
    );
  }

  if (activeRides.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Car className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">Aucune course active</p>
          <p className="text-sm text-muted-foreground mt-1">
            Acceptez une demande pour commencer
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Liste des courses actives */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {activeRides.map((ride) => (
          <Card
            key={ride.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedRide?.id === ride.id ? 'border-electric-500 border-2' : ''
            }`}
            onClick={() => setSelectedRide(ride)}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <User className="h-4 w-4 text-electric-600" />
                  {ride.customer_name}
                </span>
                <Badge variant="secondary" className="bg-electric-100 text-electric-700">
                  {ride.proposed_price}€
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {ride.pickup_address}
                </p>
              </div>

              {ride.destination_address && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {ride.destination_address}
                  </p>
                </div>
              )}

              <Separator />

              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Car className="h-3 w-3" />
                  {ride.vehicle_model}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    callCustomer(ride.customer_phone);
                  }}
                >
                  <Phone className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Suivi de la course sélectionnée */}
      {selectedRide && (
        <div className="space-y-4">
          <Card className="bg-gradient-to-r from-electric-50 to-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5 text-electric-600" />
                Course en cours - {selectedRide.customer_name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Véhicule</p>
                  <p className="font-semibold text-sm">{selectedRide.vehicle_model}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Prix</p>
                  <p className="font-semibold text-sm text-electric-600">
                    {selectedRide.proposed_price}€
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Client</p>
                  <p className="font-semibold text-sm">{selectedRide.customer_name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Contact</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8"
                    onClick={() => callCustomer(selectedRide.customer_phone)}
                  >
                    <Phone className="h-3 w-3 mr-1" />
                    Appeler
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <RideTracker
            requestId={selectedRide.request_id}
            pickupLat={selectedRide.pickup_lat}
            pickupLng={selectedRide.pickup_lng}
            destinationLat={selectedRide.destination_lat || undefined}
            destinationLng={selectedRide.destination_lng || undefined}
            isDriver={true}
          />
        </div>
      )}
    </div>
  );
};

export default ActiveRides;
