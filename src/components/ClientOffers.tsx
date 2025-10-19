import React, { useState, useEffect } from 'react';
import { Car, MapPin, Clock, Star, Euro, User, Phone, CheckCircle, X, MessageSquare, ArrowLeftRight, Calendar, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import NegotiationNotifications from './NegotiationNotifications';

interface NegotiationHistory {
  id: string;
  timestamp: string;
  from: 'client' | 'driver';
  price: string;
  duration?: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'counter_offered';
}

interface DriverOffer {
  id: string;
  driverId: string;
  driverName: string;
  driverRating: number;
  driverTotalRides: number;
  driverVehicle: string;
  driverExperience: string;
  originalRequestId: string;
  proposedPrice: string;
  estimatedDuration: string;
  message: string;
  driverPhone: string;
  status: 'pending' | 'accepted' | 'rejected' | 'counter_offered' | 'negotiating' | 'selected' | 'completed';
  receivedAt: string;
  lastActivity: string;
  negotiationHistory: NegotiationHistory[];
  responseTime: string;
  availability: string;
}

interface ClientRequest {
  id: string;
  pickupAddress: string;
  destinationAddress: string;
  vehicleModel: string;
  proposedPrice: string;
  status: 'active' | 'completed' | 'cancelled' | 'driver_selected';
  createdAt: string;
  selectedDriverId?: string;
}

const ClientOffers = () => {
  const [showCounterOfferDialog, setShowCounterOfferDialog] = useState(false);
  const [showNegotiationDialog, setShowNegotiationDialog] = useState(false);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<DriverOffer | null>(null);
  const [counterOffer, setCounterOffer] = useState({
    newPrice: '',
    message: ''
  });
  const [rating, setRating] = useState({
    stars: 0,
    comment: '',
    categories: {
      punctuality: 0,
      communication: 0,
      vehicleCondition: 0,
      professionalism: 0
    }
  });
  const [clientRequest, setClientRequest] = useState<ClientRequest | null>(null);
  const [receivedOffers, setReceivedOffers] = useState<DriverOffer[]>([]);
  const [selectedTab, setSelectedTab] = useState<'all' | 'pending' | 'negotiating' | 'selected'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Charger les données depuis Supabase avec négociations
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        setIsLoading(true);

        // Charger la demande active du client
        const { data: requests, error: requestError } = await supabase
          .from('requests')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1);

        if (requestError) throw requestError;

        if (requests && requests.length > 0) {
          const request = requests[0];
          setClientRequest({
            id: request.id,
            pickupAddress: request.pickup_address,
            destinationAddress: request.destination_address || '',
            vehicleModel: request.vehicle_model,
            proposedPrice: request.proposed_price.toString(),
            status: request.status,
            createdAt: request.created_at,
            selectedDriverId: request.selected_driver_id
          });

          // Charger les offres pour cette demande
          const { data: offers, error: offersError } = await supabase
            .from('driver_offers')
            .select('*')
            .eq('request_id', request.id)
            .order('created_at', { ascending: false });

          if (offersError) throw offersError;

          if (offers) {
            // Charger l'historique de négociation pour chaque offre
            const offersWithHistory = await Promise.all(
              offers.map(async (offer) => {
                const { data: negotiations } = await supabase
                  .rpc('get_negotiation_history', { p_offer_id: offer.id });

                return {
                  id: offer.id,
                  driverId: offer.driver_id,
                  driverName: offer.driver_name,
                  driverRating: parseFloat(offer.driver_rating?.toString() || '0'),
                  driverTotalRides: offer.driver_total_rides || 0,
                  driverVehicle: offer.driver_vehicle,
                  driverExperience: offer.driver_experience || '',
                  originalRequestId: offer.request_id,
                  proposedPrice: offer.proposed_price.toString(),
                  estimatedDuration: offer.estimated_duration,
                  message: offer.message || '',
                  driverPhone: offer.driver_phone,
                  status: offer.status as any,
                  receivedAt: offer.created_at,
                  lastActivity: offer.last_activity,
                  negotiationHistory: (negotiations || []).map((neg: any) => ({
                    id: neg.id,
                    timestamp: neg.created_at,
                    from: neg.from_role,
                    price: neg.proposed_price.toString(),
                    duration: neg.proposed_duration,
                    message: neg.message,
                    status: neg.status
                  })),
                  responseTime: offer.response_time || '< 5 min',
                  availability: offer.availability || 'Immédiate'
                };
              })
            );

            setReceivedOffers(offersWithHistory);
          }
        }
      } catch (error: any) {
        console.error('Erreur chargement données:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger vos données.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    // Écoute en temps réel des nouvelles offres ET négociations
    const offersChannel = supabase
      .channel('driver_offers_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'driver_offers'
        },
        () => {
          loadData();
        }
      )
      .subscribe();

    const negotiationsChannel = supabase
      .channel('negotiations_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'negotiations'
        },
        () => {
          loadData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(offersChannel);
      supabase.removeChannel(negotiationsChannel);
    };
  }, [user, toast]);

  const handleAcceptOffer = async (offerIdStr: string) => {
    if (!clientRequest) return;

    try {
      // Mettre à jour le statut de l'offre sélectionnée
      const { error: offerError } = await supabase
        .from('driver_offers')
        .update({ 
          status: 'selected',
          last_activity: new Date().toISOString()
        })
        .eq('id', offerIdStr);

      if (offerError) throw offerError;

      // Mettre à jour le statut de la demande
      const { error: requestError } = await supabase
        .from('requests')
        .update({ 
          status: 'driver_selected',
          selected_driver_id: offerIdStr
        })
        .eq('id', clientRequest.id);

      if (requestError) throw requestError;

      const offer = receivedOffers.find(o => o.id === offerIdStr);
      toast({
        title: "Chauffeur sélectionné !",
        description: `Vous avez choisi ${offer?.driverName}. Il va être notifié et vous contactera bientôt.`,
      });
    } catch (error: any) {
      console.error('Erreur acceptation offre:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'accepter l'offre.",
        variant: "destructive"
      });
    }
  };

  const handleRejectOffer = async (offerIdStr: string) => {
    try {
      const { error } = await supabase
        .from('driver_offers')
        .update({ 
          status: 'rejected',
          last_activity: new Date().toISOString()
        })
        .eq('id', offerIdStr);

      if (error) throw error;

      toast({
        title: "Offre rejetée",
        description: "Le chauffeur a été notifié du refus.",
      });
    } catch (error: any) {
      console.error('Erreur rejet offre:', error);
      toast({
        title: "Erreur",
        description: "Impossible de rejeter l'offre.",
        variant: "destructive"
      });
    }
  };

  const openCounterOffer = (offer: DriverOffer) => {
    setSelectedOffer(offer);
    setCounterOffer({ newPrice: '', message: '' });
    setShowCounterOfferDialog(true);
  };

  const submitCounterOffer = async () => {
    if (!selectedOffer || !user) return;

    try {
      // Créer une entrée dans la table negotiations
      const { error } = await supabase
        .from('negotiations')
        .insert({
          offer_id: selectedOffer.id,
          from_user_id: user.id,
          from_role: 'client',
          proposed_price: parseFloat(counterOffer.newPrice),
          message: counterOffer.message,
          status: 'pending'
        });

      if (error) throw error;

      // Mettre à jour le statut de l'offre
      const { error: updateError } = await supabase
        .from('driver_offers')
        .update({ 
          status: 'negotiating',
          last_activity: new Date().toISOString()
        })
        .eq('id', selectedOffer.id);

      if (updateError) throw updateError;

      toast({
        title: "Contre-proposition envoyée !",
        description: `Votre nouvelle offre de ${counterOffer.newPrice}€ a été envoyée à ${selectedOffer?.driverName}.`,
      });

      setShowCounterOfferDialog(false);
      setSelectedOffer(null);
      setCounterOffer({ newPrice: '', message: '' });
    } catch (error: any) {
      console.error('Erreur contre-offre:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la contre-proposition.",
        variant: "destructive"
      });
    }
  };

  const openNegotiationHistory = (offer: DriverOffer) => {
    setSelectedOffer(offer);
    setShowNegotiationDialog(true);
  };

  const openRatingDialog = (offer: DriverOffer) => {
    setSelectedOffer(offer);
    setRating({
      stars: 0,
      comment: '',
      categories: {
        punctuality: 0,
        communication: 0,
        vehicleCondition: 0,
        professionalism: 0
      }
    });
    setShowRatingDialog(true);
  };

  const submitRating = async () => {
    if (!selectedOffer || !user || !clientRequest) return;

    try {
      const { error } = await supabase
        .from('ratings')
        .insert({
          driver_id: selectedOffer.driverId,
          client_id: user.id,
          request_id: clientRequest.id,
          offer_id: selectedOffer.id,
          overall_rating: rating.stars,
          punctuality_rating: rating.categories.punctuality || null,
          communication_rating: rating.categories.communication || null,
          vehicle_condition_rating: rating.categories.vehicleCondition || null,
          professionalism_rating: rating.categories.professionalism || null,
          comment: rating.comment || null
        });

      if (error) {
        // Si l'évaluation existe déjà, la mettre à jour
        if (error.code === '23505') {
          const { error: updateError } = await supabase
            .from('ratings')
            .update({
              overall_rating: rating.stars,
              punctuality_rating: rating.categories.punctuality || null,
              communication_rating: rating.categories.communication || null,
              vehicle_condition_rating: rating.categories.vehicleCondition || null,
              professionalism_rating: rating.categories.professionalism || null,
              comment: rating.comment || null,
              updated_at: new Date().toISOString()
            })
            .eq('client_id', user.id)
            .eq('request_id', clientRequest.id);

          if (updateError) throw updateError;
        } else {
          throw error;
        }
      }

      toast({
        title: "Évaluation soumise !",
        description: `Merci d'avoir évalué ${selectedOffer?.driverName}. Votre avis aidera les futurs clients.`,
      });

      setShowRatingDialog(false);
      setSelectedOffer(null);
      setRating({
        stars: 0,
        comment: '',
        categories: {
          punctuality: 0,
          communication: 0,
          vehicleCondition: 0,
          professionalism: 0
        }
      });
    } catch (error: any) {
      console.error('Erreur soumission évaluation:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de soumettre l'évaluation.",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'negotiating': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'selected': return 'bg-green-100 text-green-700 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      case 'completed': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'negotiating': return 'Négociation';
      case 'selected': return 'Sélectionné';
      case 'rejected': return 'Rejeté';
      case 'completed': return 'Terminé';
      default: return 'Inconnu';
    }
  };

  const filteredOffers = receivedOffers.filter(offer => {
    switch (selectedTab) {
      case 'pending': return offer.status === 'pending';
      case 'negotiating': return offer.status === 'negotiating';
      case 'selected': return offer.status === 'selected';
      default: return true;
    }
  });

  const StarRating = ({ rating, onRatingChange, size = 5 }: { rating: number, onRatingChange?: (rating: number) => void, size?: number }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-${size} w-${size} cursor-pointer ${
              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
            onClick={() => onRatingChange?.(star)}
          />
        ))}
      </div>
    );
  };

  // Si aucune demande active, afficher un message
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Mes Offres Reçues</h2>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!clientRequest) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Mes Offres Reçues</h2>
          <p className="text-muted-foreground">Aucune demande active</p>
        </div>
        
        <Card className="bg-gradient-to-r from-electric-50 to-blue-50 border-electric-200">
          <CardContent className="p-6 text-center">
            <p className="text-electric-700">
              Vous devez d'abord publier une demande pour recevoir des offres des chauffeurs.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Faire une proposition</h2>
        <p className="text-muted-foreground">Gérez les propositions des chauffeurs</p>
      </div>

      {/* Notifications de négociations */}
      <NegotiationNotifications />

      {/* Ma demande active */}
      <Card className="bg-gradient-to-r from-electric-50 to-blue-50 border-electric-200">
        <CardHeader>
          <CardTitle className="text-electric-800">Ma demande active</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-electric-600" />
              <span className="text-sm">{clientRequest.pickupAddress}</span>
            </div>
            {clientRequest.destinationAddress && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-electric-600" />
                <span className="text-sm">→ {clientRequest.destinationAddress}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Car className="h-4 w-4 text-electric-600" />
              <span className="text-sm">{clientRequest.vehicleModel}</span>
            </div>
            <div className="flex items-center gap-2">
              <Euro className="h-4 w-4 text-electric-600" />
              <span className="text-sm font-medium">Prix proposé: {clientRequest.proposedPrice}€</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Statistics */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-electric-600">{receivedOffers.length}</div>
            <p className="text-xs text-muted-foreground">Offres reçues</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {receivedOffers.filter(o => o.status === 'negotiating').length}
            </div>
            <p className="text-xs text-muted-foreground">En négociation</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {receivedOffers.filter(o => o.status === 'selected').length}
            </div>
            <p className="text-xs text-muted-foreground">Sélectionnés</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {receivedOffers.length > 0 ? Math.round(receivedOffers.reduce((acc, o) => acc + o.driverRating, 0) / receivedOffers.length * 10) / 10 : 0}
            </div>
            <p className="text-xs text-muted-foreground">Note moyenne</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { key: 'all', label: 'Toutes', count: receivedOffers.length },
          { key: 'pending', label: 'En attente', count: receivedOffers.filter(o => o.status === 'pending').length },
          { key: 'negotiating', label: 'Négociation', count: receivedOffers.filter(o => o.status === 'negotiating').length },
          { key: 'selected', label: 'Sélectionnés', count: receivedOffers.filter(o => o.status === 'selected').length }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setSelectedTab(tab.key as any)}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              selectedTab === tab.key
                ? 'bg-white text-electric-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Enhanced Offers List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Offres des chauffeurs</h3>
        
        {filteredOffers.length === 0 ? (
          <Card className="bg-gray-50">
            <CardContent className="p-6 text-center">
              <p className="text-gray-600">
                {selectedTab === 'all' 
                  ? "En attente des offres des chauffeurs..." 
                  : `Aucune offre ${selectedTab === 'pending' ? 'en attente' : selectedTab === 'negotiating' ? 'en négociation' : 'sélectionnée'}`
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredOffers.map((offer) => (
            <Card key={offer.id} className="hover:shadow-md transition-all duration-200 border-l-4 border-l-electric-300">
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-foreground">{offer.driverName}</h4>
                        <StarRating rating={offer.driverRating} />
                        <span className="text-xs text-muted-foreground">({offer.driverTotalRides} courses)</span>
                        <Badge className={getStatusColor(offer.status)}>
                          {getStatusLabel(offer.status)}
                        </Badge>
                        {(offer.negotiationHistory || []).length > 0 && (
                          <Badge variant="outline" className="text-blue-600">
                            {(offer.negotiationHistory || []).length} échange(s)
                          </Badge>
                        )}
                      </div>
                      
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Car className="h-3 w-3" />
                          <span>{offer.driverVehicle}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>Durée estimée: {offer.estimatedDuration}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span>{offer.driverPhone}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{offer.driverExperience}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Disponible: {offer.availability}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-electric-600">{offer.proposedPrice}€</div>
                      <div className="text-xs text-muted-foreground">
                        Réponse: {offer.responseTime}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Dernière activité: {new Date(offer.lastActivity).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>

                  {offer.message && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-start gap-2">
                        <MessageSquare className="h-4 w-4 text-gray-500 mt-0.5" />
                        <div>
                          <span className="text-sm font-medium text-gray-700">Message du chauffeur:</span>
                          <p className="text-sm text-gray-600 mt-1">{offer.message}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 flex-wrap">
                    {offer.status === 'pending' && (
                      <>
                        <Button 
                          size="sm"
                          onClick={() => handleAcceptOffer(offer.id)}
                          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Accepter
                        </Button>
                        <Button 
                          size="sm"
                          variant="outline"
                          onClick={() => openCounterOffer(offer)}
                          className="border-electric-300 text-electric-700 hover:bg-electric-50"
                        >
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Négocier
                        </Button>
                        <Button 
                          size="sm"
                          variant="outline"
                          onClick={() => handleRejectOffer(offer.id)}
                          className="border-red-300 text-red-700 hover:bg-red-50"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Refuser
                        </Button>
                      </>
                    )}

                    {offer.status === 'negotiating' && (
                      <>
                        <Button 
                          size="sm"
                          variant="outline"
                          onClick={() => openNegotiationHistory(offer)}
                          className="border-blue-300 text-blue-700 hover:bg-blue-50"
                        >
                          <ArrowLeftRight className="h-3 w-3 mr-1" />
                          Voir négociation
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleAcceptOffer(offer.id)}
                          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Accepter dernière offre
                        </Button>
                      </>
                    )}

                    {offer.status === 'selected' && (
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => openRatingDialog(offer)}
                        className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                      >
                        <Star className="h-3 w-3 mr-1" />
                        Évaluer le chauffeur
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Dialog pour contre-proposition */}
      <Dialog open={showCounterOfferDialog} onOpenChange={setShowCounterOfferDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Négocier avec {selectedOffer?.driverName}</DialogTitle>
            <DialogDescription>
              Proposez un nouveau prix ou des conditions différentes
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Offre actuelle:</span> {selectedOffer?.proposedPrice}€ pour {selectedOffer?.estimatedDuration}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPrice">Votre contre-proposition (€)</Label>
              <Input
                id="newPrice"
                type="number"
                placeholder="32"
                value={counterOffer.newPrice}
                onChange={(e) => setCounterOffer({ ...counterOffer, newPrice: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">Message pour le chauffeur</Label>
              <Textarea
                id="message"
                placeholder="Expliquez votre contre-proposition..."
                value={counterOffer.message}
                onChange={(e) => setCounterOffer({ ...counterOffer, message: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCounterOfferDialog(false)}>
              Annuler
            </Button>
            <Button 
              onClick={submitCounterOffer} 
              className="bg-electric-500 hover:bg-electric-600"
              disabled={!counterOffer.newPrice}
            >
              Envoyer la contre-proposition
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Negotiation History Dialog */}
      <Dialog open={showNegotiationDialog} onOpenChange={setShowNegotiationDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Historique de négociation avec {selectedOffer?.driverName}</DialogTitle>
            <DialogDescription>
              Suivez l'évolution de vos échanges
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {(selectedOffer?.negotiationHistory || []).map((nego, index) => (
              <div key={nego.id} className={`p-3 rounded-lg ${
                nego.from === 'client' ? 'bg-electric-50 ml-4' : 'bg-gray-50 mr-4'
              }`}>
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium">
                    {nego.from === 'client' ? 'Vous' : selectedOffer.driverName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(nego.timestamp).toLocaleString('fr-FR')}
                  </span>
                </div>
                <div className="text-lg font-bold text-electric-600 mb-1">
                  {nego.price}€ {nego.duration && `- ${nego.duration}`}
                </div>
                {nego.message && (
                  <p className="text-sm text-gray-600">{nego.message}</p>
                )}
                <Badge className={getStatusColor(nego.status)}>
                  {getStatusLabel(nego.status)}
                </Badge>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNegotiationDialog(false)}>
              Fermer
            </Button>
            <Button 
              onClick={() => {
                setShowNegotiationDialog(false);
                openCounterOffer(selectedOffer!);
              }}
              className="bg-electric-500 hover:bg-electric-600"
            >
              Continuer la négociation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Driver Rating Dialog */}
      <Dialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Évaluer {selectedOffer?.driverName}</DialogTitle>
            <DialogDescription>
              Votre avis aide à améliorer le service pour tous
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="text-center">
              <p className="mb-4">Note générale</p>
              <StarRating 
                rating={rating.stars} 
                onRatingChange={(stars) => setRating({...rating, stars})}
                size={8}
              />
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Évaluation détaillée</h4>
              
              {Object.entries({
                punctuality: 'Ponctualité',
                communication: 'Communication',
                vehicleCondition: 'État du véhicule',
                professionalism: 'Professionnalisme'
              }).map(([key, label]) => (
                <div key={key} className="flex justify-between items-center">
                  <span className="text-sm">{label}</span>
                  <StarRating
                    rating={rating.categories[key as keyof typeof rating.categories]}
                    onRatingChange={(stars) => setRating({
                      ...rating,
                      categories: { ...rating.categories, [key]: stars }
                    })}
                  />
                </div>
              ))}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="comment">Commentaire (optionnel)</Label>
              <Textarea
                id="comment"
                placeholder="Partagez votre expérience avec ce chauffeur..."
                value={rating.comment}
                onChange={(e) => setRating({ ...rating, comment: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRatingDialog(false)}>
              Annuler
            </Button>
            <Button 
              onClick={submitRating} 
              className="bg-yellow-500 hover:bg-yellow-600"
              disabled={rating.stars === 0}
            >
              Soumettre l'évaluation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientOffers;
