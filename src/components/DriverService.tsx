import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import NearbyChargersDrivers from './NearbyChargersDrivers';
import DriverProfile from './driver/DriverProfile';
import DriverTabs from './driver/DriverTabs';
import AvailableRequests from './driver/AvailableRequests';
import ClientRequests from './driver/ClientRequests';
import MyOffers from './driver/MyOffers';
import DriverStats from './driver/DriverStats';
import CounterOfferDialog from './driver/CounterOfferDialog';
import WalletManagement from './WalletManagement';
import DriverRatings from './DriverRatings';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface DriverRequest {
  id: string;
  customerName: string;
  pickupAddress: string;
  returnAddress: string;
  vehicleModel: string;
  estimatedTime: string;
  payment: string;
  distance: string;
  batteryLevel: number;
  urgency: 'low' | 'medium' | 'high';
}

interface ClientRequest {
  id: string;
  customerName: string;
  pickupAddress: string;
  destinationAddress: string;
  vehicleModel: string;
  urgency: 'low' | 'medium' | 'high';
  estimatedDuration: string;
  proposedPrice: string;
  batteryLevel: string;
  notes: string;
  contactPhone: string;
  status: 'pending' | 'accepted' | 'rejected' | 'counter_offered';
}

const DriverService = () => {
  const [activeTab, setActiveTab] = useState<'available' | 'client_requests' | 'my_offers' | 'network' | 'wallet' | 'ratings'>('network');
  const [counterOffer, setCounterOffer] = useState({
    requestId: '',
    newPrice: '',
    newDuration: '',
    message: ''
  });
  const [showCounterOfferDialog, setShowCounterOfferDialog] = useState(false);
  const [myOffers, setMyOffers] = useState<any[]>([]);
  const [availableRequests, setAvailableRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user, profile, hasRole } = useAuth();

  // Charger les demandes, offres et stats depuis Supabase
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        setIsLoading(true);

        // Charger toutes les demandes actives
        const { data: requests, error: requestsError } = await supabase
          .from('requests')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        if (requestsError) throw requestsError;

        if (requests) {
          setAvailableRequests(requests.map(req => ({
            id: req.id,
            customerName: 'Client',
            pickupAddress: req.pickup_address,
            returnAddress: req.destination_address || req.pickup_address,
            vehicleModel: req.vehicle_model,
            estimatedTime: req.estimated_duration || '2h',
            payment: `${req.proposed_price}€`,
            distance: '1.2 km',
            batteryLevel: req.battery_level,
            urgency: req.urgency
          })));
        }

        // Charger mes offres
        const { data: offers, error: offersError } = await supabase
          .from('driver_offers')
          .select('*')
          .eq('driver_id', user.id)
          .order('created_at', { ascending: false });

        if (offersError) throw offersError;

        if (offers) {
          setMyOffers(offers.map(offer => ({
            id: offer.id,
            requestId: offer.request_id,
            status: offer.status,
            proposedPrice: parseFloat(offer.proposed_price.toString()),
            estimatedDuration: offer.estimated_duration,
            message: offer.message || '',
            sentAt: offer.created_at
          })));
        }

        // Charger les stats du chauffeur
        if (hasRole('chauffeur')) {
          const { data: stats, error: statsError } = await supabase
            .from('driver_stats')
            .select('*')
            .eq('driver_id', user.id)
            .single();

          if (statsError && statsError.code !== 'PGRST116') {
            console.error('Erreur stats:', statsError);
          }

          // Les stats seront utilisées plus tard pour l'affichage
          if (stats) {
            console.log('Stats du chauffeur:', stats);
          }
        }
      } catch (error: any) {
        console.error('Erreur chargement données:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    // Écoute temps réel des nouvelles demandes
    const channel = supabase
      .channel('requests_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'requests',
          filter: 'status=eq.active'
        },
        () => {
          loadData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, hasRole]);

  const handleAcceptRequest = async (requestIdStr: string) => {
    if (!user || !profile) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté en tant que chauffeur.",
        variant: "destructive"
      });
      return;
    }

    try {
      const request = availableRequests.find(r => r.id === requestIdStr);
      if (!request) return;

      // Charger les stats du chauffeur
      const { data: stats } = await supabase
        .from('driver_stats')
        .select('*')
        .eq('driver_id', user.id)
        .single();

      const { error } = await supabase
        .from('driver_offers')
        .insert({
          request_id: requestIdStr,
          driver_id: user.id,
          driver_name: profile.full_name || 'Chauffeur Pro',
          driver_rating: stats?.average_rating || 4.9,
          driver_total_rides: stats?.completed_rides || 0,
          driver_vehicle: 'Peugeot 208',
          driver_experience: "5 ans d'expérience",
          proposed_price: parseFloat(request.payment.replace('€', '')),
          estimated_duration: request.estimatedTime,
          message: 'Je peux prendre en charge votre demande rapidement !',
          driver_phone: profile.phone || '+33 6 12 34 56 78',
          status: 'pending',
          response_time: '< 5 min',
          availability: 'Immédiate'
        });

      if (error) throw error;

      toast({
        title: "Offre envoyée !",
        description: "Votre proposition a été envoyée au client.",
      });
    } catch (error: any) {
      console.error('Erreur envoi offre:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer l'offre.",
        variant: "destructive"
      });
    }
  };

  const handleCounterOffer = (requestIdStr: string) => {
    setCounterOffer({ ...counterOffer, requestId: requestIdStr });
    setShowCounterOfferDialog(true);
  };

  const submitCounterOffer = () => {
    toast({
      title: "Contre-proposition envoyée !",
      description: "Le client recevra votre nouvelle proposition.",
    });
    setShowCounterOfferDialog(false);
    setCounterOffer({ requestId: '', newPrice: '', newDuration: '', message: '' });
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'Urgent';
      case 'medium': return 'Modéré';
      case 'low': return 'Flexible';
      default: return 'Normal';
    }
  };

  const renderTabContent = () => {
    if (isLoading) {
      return <div className="text-center py-8">Chargement...</div>;
    }

    switch (activeTab) {
      case 'available':
        return (
          <AvailableRequests
            requests={availableRequests}
            onAcceptRequest={handleAcceptRequest}
            getUrgencyColor={getUrgencyColor}
            getUrgencyLabel={getUrgencyLabel}
          />
        );
      case 'client_requests':
        return (
          <div className="text-center py-8 text-muted-foreground">
            Fonctionnalité en développement
          </div>
        );
      case 'my_offers':
        return <MyOffers offers={myOffers} />;
      case 'network':
        return <NearbyChargersDrivers />;
      case 'wallet':
        return <WalletManagement />;
      case 'ratings':
        return user ? <DriverRatings driverId={user.id} /> : null;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Interface Chauffeur</h2>
        <p className="text-muted-foreground">Gérez vos demandes et trouvez de nouveaux clients</p>
      </div>

      <DriverProfile />

      <DriverTabs 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        myOffersCount={myOffers.length}
      />

      {renderTabContent()}

      <CounterOfferDialog
        isOpen={showCounterOfferDialog}
        onClose={() => setShowCounterOfferDialog(false)}
        counterOffer={counterOffer}
        setCounterOffer={setCounterOffer}
        onSubmit={submitCounterOffer}
      />

      <DriverStats />
    </div>
  );
};

export default DriverService;
