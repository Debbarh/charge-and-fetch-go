
import React, { useState, useEffect } from 'react';
import { Car, MapPin, Clock, Star, Euro, User, Phone, CheckCircle, X, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface DriverOffer {
  id: number;
  driverId: number;
  driverName: string;
  driverRating: number;
  driverVehicle: string;
  originalRequestId: number;
  proposedPrice: string;
  estimatedDuration: string;
  message: string;
  driverPhone: string;
  status: 'pending' | 'accepted' | 'rejected' | 'counter_offered';
  receivedAt: string;
}

interface ClientRequest {
  id: number;
  pickupAddress: string;
  destinationAddress: string;
  vehicleModel: string;
  proposedPrice: string;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: string;
}

const ClientOffers = () => {
  const [showCounterOfferDialog, setShowCounterOfferDialog] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<DriverOffer | null>(null);
  const [counterOffer, setCounterOffer] = useState({
    newPrice: '',
    message: ''
  });
  const [clientRequest, setClientRequest] = useState<ClientRequest | null>(null);
  const [receivedOffers, setReceivedOffers] = useState<DriverOffer[]>([]);
  const { toast } = useToast();

  // Charger les données depuis localStorage
  useEffect(() => {
    const activeRequest = localStorage.getItem('activeClientRequest');
    const offers = localStorage.getItem('receivedOffers');
    
    if (activeRequest) {
      setClientRequest(JSON.parse(activeRequest));
    }
    
    if (offers) {
      setReceivedOffers(JSON.parse(offers));
    }
  }, []);

  const handleAcceptOffer = (offerId: number) => {
    const offer = receivedOffers.find(o => o.id === offerId);
    toast({
      title: "Offre acceptée !",
      description: `Vous avez choisi ${offer?.driverName}. Il va être notifié et vous contactera bientôt.`,
    });
  };

  const handleRejectOffer = (offerId: number) => {
    toast({
      title: "Offre rejetée",
      description: "Le chauffeur a été notifié du refus.",
    });
  };

  const openCounterOffer = (offer: DriverOffer) => {
    setSelectedOffer(offer);
    setCounterOffer({ newPrice: '', message: '' });
    setShowCounterOfferDialog(true);
  };

  const submitCounterOffer = () => {
    toast({
      title: "Contre-proposition envoyée !",
      description: `Votre nouvelle offre de ${counterOffer.newPrice}€ a été envoyée à ${selectedOffer?.driverName}.`,
    });
    setShowCounterOfferDialog(false);
    setSelectedOffer(null);
    setCounterOffer({ newPrice: '', message: '' });
  };

  const getOfferStatusColor = (offer: DriverOffer) => {
    if (!clientRequest) return 'bg-gray-100 text-gray-700 border-gray-200';
    
    const originalPrice = parseInt(clientRequest.proposedPrice);
    const proposedPrice = parseInt(offer.proposedPrice);
    
    if (proposedPrice <= originalPrice) {
      return 'bg-green-100 text-green-700 border-green-200';
    } else if (proposedPrice <= originalPrice * 1.2) {
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    } else {
      return 'bg-red-100 text-red-700 border-red-200';
    }
  };

  const getOfferStatusLabel = (offer: DriverOffer) => {
    if (!clientRequest) return 'Prix proposé';
    
    const originalPrice = parseInt(clientRequest.proposedPrice);
    const proposedPrice = parseInt(offer.proposedPrice);
    
    if (proposedPrice <= originalPrice) {
      return 'Prix accepté';
    } else if (proposedPrice <= originalPrice * 1.2) {
      return 'Prix proche';
    } else {
      return 'Prix supérieur';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  // Si aucune demande active, afficher un message
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
        <h2 className="text-2xl font-bold text-foreground mb-2">Mes Offres Reçues</h2>
        <p className="text-muted-foreground">Gérez les propositions des chauffeurs</p>
      </div>

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

      {/* Statistiques des offres */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-electric-600">{receivedOffers.length}</div>
            <p className="text-xs text-muted-foreground">Offres reçues</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {receivedOffers.filter(o => parseInt(o.proposedPrice) <= parseInt(clientRequest.proposedPrice)).length}
            </div>
            <p className="text-xs text-muted-foreground">Au prix demandé</p>
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

      {/* Liste des offres */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Offres des chauffeurs</h3>
        
        {receivedOffers.length === 0 ? (
          <Card className="bg-gray-50">
            <CardContent className="p-6 text-center">
              <p className="text-gray-600">
                En attente des offres des chauffeurs... Les offres arrivent généralement dans les premières minutes.
              </p>
            </CardContent>
          </Card>
        ) : (
          receivedOffers.map((offer) => (
            <Card key={offer.id} className="hover:shadow-md transition-all duration-200">
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-foreground">{offer.driverName}</h4>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                          <span className="text-xs text-muted-foreground">{offer.driverRating}</span>
                        </div>
                        <Badge className={getOfferStatusColor(offer)}>
                          {getOfferStatusLabel(offer)}
                        </Badge>
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
                          <Clock className="h-3 w-3" />
                          <span>Reçu à {formatTime(offer.receivedAt)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-electric-600">{offer.proposedPrice}€</div>
                      <div className="text-xs text-muted-foreground">
                        {parseInt(offer.proposedPrice) === parseInt(clientRequest.proposedPrice) ? 
                          'Prix demandé' : 
                          `${parseInt(offer.proposedPrice) > parseInt(clientRequest.proposedPrice) ? '+' : ''}${parseInt(offer.proposedPrice) - parseInt(clientRequest.proposedPrice)}€`
                        }
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

                  <div className="flex gap-2">
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
    </div>
  );
};

export default ClientOffers;
