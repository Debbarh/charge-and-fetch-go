import React, { useState, useEffect } from 'react';
import { Car, MapPin, Clock, Star, Euro, User, Phone, CheckCircle, X, Edit3, MessageSquare, Award, TrendingUp, Users, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import NearbyChargersDrivers from './NearbyChargersDrivers';

interface DriverRequest {
  id: number;
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
  id: number;
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

interface DriverProfile {
  name: string;
  phone: string;
  experience: string;
  vehicle: string;
  notes: string;
  rating: number;
  totalRides: number;
  completionRate: number;
  responseTime: string;
  specialties: string[];
}

const DriverService = () => {
  const [isDriver, setIsDriver] = useState(false);
  const [activeTab, setActiveTab] = useState<'available' | 'client_requests' | 'my_offers' | 'network'>('available');
  const [driverProfile, setDriverProfile] = useState<DriverProfile>({
    name: '',
    phone: '',
    experience: '',
    vehicle: '',
    notes: '',
    rating: 4.9,
    totalRides: 127,
    completionRate: 98,
    responseTime: '< 5 min',
    specialties: ['Véhicules électriques', 'Urgences', 'Longue distance']
  });
  const [counterOffer, setCounterOffer] = useState({
    requestId: 0,
    newPrice: '',
    newDuration: '',
    message: ''
  });
  const [showCounterOfferDialog, setShowCounterOfferDialog] = useState(false);
  const [myOffers, setMyOffers] = useState<any[]>([]);
  const { toast } = useToast();

  // Simulated client requests from the ClientRequestForm
  const clientRequests: ClientRequest[] = [
    {
      id: 101,
      customerName: "Sophie M.",
      pickupAddress: "78 Boulevard Saint-Germain, Paris",
      destinationAddress: "Tesla Supercharger République",
      vehicleModel: "Peugeot e-208",
      urgency: 'high',
      estimatedDuration: "4h",
      proposedPrice: "35",
      batteryLevel: "8",
      notes: "Parking souterrain, code 1234. Véhicule en zone bleue.",
      contactPhone: "+33 6 12 34 56 78",
      status: 'pending'
    },
    {
      id: 102,
      customerName: "Marc T.",
      pickupAddress: "15 Rue de la Paix, Paris",
      destinationAddress: "",
      vehicleModel: "BMW i3",
      urgency: 'medium',
      estimatedDuration: "2h",
      proposedPrice: "20",
      batteryLevel: "12",
      notes: "Disponible toute la journée",
      contactPhone: "+33 6 98 76 54 32",
      status: 'pending'
    }
  ];

  // Load driver offers from localStorage
  useEffect(() => {
    const savedOffers = localStorage.getItem('driverOffers');
    if (savedOffers) {
      setMyOffers(JSON.parse(savedOffers));
    }
  }, []);

  const availableRequests: DriverRequest[] = [
    {
      id: 1,
      customerName: "Marie L.",
      pickupAddress: "123 Rue de Rivoli, Paris",
      returnAddress: "123 Rue de Rivoli, Paris",
      vehicleModel: "Tesla Model 3",
      estimatedTime: "2h",
      payment: "25€",
      distance: "1.2 km",
      batteryLevel: 15,
      urgency: 'high'
    },
    {
      id: 2,
      customerName: "Jean D.",
      pickupAddress: "45 Avenue des Champs, Paris",
      returnAddress: "45 Avenue des Champs, Paris",
      vehicleModel: "Renault Zoe",
      estimatedTime: "3h",
      payment: "18€",
      distance: "0.8 km",
      batteryLevel: 25,
      urgency: 'medium'
    }
  ];

  const handleBecomeDriver = (e: React.FormEvent) => {
    e.preventDefault();
    setIsDriver(true);
    toast({
      title: "Inscription validée !",
      description: "Vous êtes maintenant chauffeur-valet. Vous pouvez voir les demandes disponibles.",
    });
  };

  const handleAcceptRequest = (requestId: number) => {
    // Simulate creating an offer
    const newOffer = {
      id: Date.now(),
      requestId: requestId,
      status: 'sent',
      proposedPrice: Math.floor(Math.random() * 20) + 20,
      estimatedDuration: `${Math.floor(Math.random() * 3) + 2}h`,
      message: 'Je peux prendre en charge votre demande rapidement !',
      sentAt: new Date().toISOString()
    };

    const updatedOffers = [...myOffers, newOffer];
    setMyOffers(updatedOffers);
    localStorage.setItem('driverOffers', JSON.stringify(updatedOffers));

    toast({
      title: "Offre envoyée !",
      description: "Votre proposition a été envoyée au client.",
    });
  };

  const handleAcceptClientRequest = (requestId: number) => {
    const request = clientRequests.find(r => r.id === requestId);
    if (!request) return;

    // Create driver offer and add to localStorage for ClientOffers component
    const driverOffer = {
      id: Date.now(),
      driverId: 1,
      driverName: driverProfile.name || 'Chauffeur Pro',
      driverRating: driverProfile.rating,
      driverTotalRides: driverProfile.totalRides,
      driverVehicle: driverProfile.vehicle || 'Peugeot 208',
      driverExperience: driverProfile.experience || '5 ans d\'expérience',
      originalRequestId: requestId,
      proposedPrice: request.proposedPrice,
      estimatedDuration: request.estimatedDuration,
      message: 'J\'accepte votre demande aux conditions proposées !',
      driverPhone: driverProfile.phone || '+33 6 12 34 56 78',
      status: 'pending',
      receivedAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      negotiationHistory: [],
      responseTime: driverProfile.responseTime,
      availability: 'Immédiate'
    };

    // Add to received offers in localStorage
    const existingOffers = JSON.parse(localStorage.getItem('receivedOffers') || '[]');
    const updatedOffers = [...existingOffers, driverOffer];
    localStorage.setItem('receivedOffers', JSON.stringify(updatedOffers));

    // Add to my offers tracking
    const myOffer = {
      id: driverOffer.id,
      requestId: requestId,
      status: 'sent',
      proposedPrice: request.proposedPrice,
      estimatedDuration: request.estimatedDuration,
      message: driverOffer.message,
      sentAt: new Date().toISOString()
    };

    const updatedMyOffers = [...myOffers, myOffer];
    setMyOffers(updatedMyOffers);
    localStorage.setItem('driverOffers', JSON.stringify(updatedMyOffers));

    toast({
      title: "Demande client acceptée !",
      description: "Le client a été notifié de votre acceptation.",
    });
  };

  const handleRejectClientRequest = (requestId: number) => {
    toast({
      title: "Demande rejetée",
      description: "La demande a été retirée de votre liste.",
    });
  };

  const handleCounterOffer = (requestId: number) => {
    setCounterOffer({ ...counterOffer, requestId });
    setShowCounterOfferDialog(true);
  };

  const submitCounterOffer = () => {
    const request = clientRequests.find(r => r.id === counterOffer.requestId);
    if (!request) return;

    // Create counter-offer and add to localStorage
    const driverOffer = {
      id: Date.now(),
      driverId: 1,
      driverName: driverProfile.name || 'Chauffeur Pro',
      driverRating: driverProfile.rating,
      driverTotalRides: driverProfile.totalRides,
      driverVehicle: driverProfile.vehicle || 'Peugeot 208',
      driverExperience: driverProfile.experience || '5 ans d\'expérience',
      originalRequestId: counterOffer.requestId,
      proposedPrice: counterOffer.newPrice,
      estimatedDuration: counterOffer.newDuration || request.estimatedDuration,
      message: counterOffer.message,
      driverPhone: driverProfile.phone || '+33 6 12 34 56 78',
      status: 'pending',
      receivedAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      negotiationHistory: [{
        id: Date.now(),
        timestamp: new Date().toISOString(),
        from: 'driver',
        price: counterOffer.newPrice,
        duration: counterOffer.newDuration,
        message: counterOffer.message,
        status: 'pending'
      }],
      responseTime: driverProfile.responseTime,
      availability: 'Immédiate'
    };

    const existingOffers = JSON.parse(localStorage.getItem('receivedOffers') || '[]');
    const updatedOffers = [...existingOffers, driverOffer];
    localStorage.setItem('receivedOffers', JSON.stringify(updatedOffers));

    toast({
      title: "Contre-proposition envoyée !",
      description: "Le client recevra votre nouvelle proposition.",
    });
    setShowCounterOfferDialog(false);
    setCounterOffer({ requestId: 0, newPrice: '', newDuration: '', message: '' });
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

  if (!isDriver) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Devenir Chauffeur-Valet</h2>
          <p className="text-muted-foreground">Gagnez de l'argent en aidant les propriétaires de véhicules électriques</p>
        </div>

        <Card className="bg-gradient-to-r from-blue-50 to-electric-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="font-semibold text-blue-800 mb-4">Pourquoi devenir chauffeur-valet ?</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <Euro className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-blue-700">Revenus flexibles</p>
                <p className="text-xs text-blue-600">15-35€ par service</p>
              </div>
              <div className="text-center">
                <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-blue-700">Horaires libres</p>
                <p className="text-xs text-blue-600">Travaillez quand vous voulez</p>
              </div>
              <div className="text-center">
                <Car className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-blue-700">Simple</p>
                <p className="text-xs text-blue-600">Récupérer, recharger, livrer</p>
              </div>
              <div className="text-center">
                <CheckCircle className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-blue-700">Sécurisé</p>
                <p className="text-xs text-blue-600">Assurance incluse</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inscription Chauffeur</CardTitle>
            <CardDescription>Remplissez ce formulaire pour commencer</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBecomeDriver} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet</Label>
                  <Input
                    id="name"
                    placeholder="Jean Dupont"
                    value={driverProfile.name}
                    onChange={(e) => setDriverProfile({ ...driverProfile, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+33 6 12 34 56 78"
                    value={driverProfile.phone}
                    onChange={(e) => setDriverProfile({ ...driverProfile, phone: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehicle">Votre véhicule</Label>
                <Input
                  id="vehicle"
                  placeholder="Renault Clio, Peugeot 208..."
                  value={driverProfile.vehicle}
                  onChange={(e) => setDriverProfile({ ...driverProfile, vehicle: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Expérience de conduite</Label>
                <Input
                  id="experience"
                  placeholder="5 ans de permis, habitué des véhicules électriques..."
                  value={driverProfile.experience}
                  onChange={(e) => setDriverProfile({ ...driverProfile, experience: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Informations supplémentaires (optionnel)</Label>
                <Textarea
                  id="notes"
                  placeholder="Disponibilités, zones de prédilection..."
                  value={driverProfile.notes}
                  onChange={(e) => setDriverProfile({ ...driverProfile, notes: e.target.value })}
                  rows={3}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-500 to-electric-500 hover:from-blue-600 hover:to-electric-600"
              >
                <User className="h-4 w-4 mr-2" />
                Devenir Chauffeur-Valet
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Interface Chauffeur</h2>
        <p className="text-muted-foreground">Gérez vos demandes et trouvez de nouveaux clients</p>
      </div>

      {/* Enhanced Driver Profile Card */}
      <Card className="bg-gradient-to-r from-electric-50 to-blue-50 border-electric-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-electric-800 mb-1">
                {driverProfile.name || 'Chauffeur'} 
                <Badge className="ml-2 bg-green-100 text-green-700">
                  <Award className="h-3 w-3 mr-1" />
                  Chauffeur Vérifié
                </Badge>
              </h3>
              <div className="flex items-center gap-4 text-sm text-electric-600">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  <span className="font-medium">{driverProfile.rating}</span>
                  <span className="text-electric-500">({driverProfile.totalRides} courses)</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  <span>{driverProfile.completionRate}% réussite</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>Répond en {driverProfile.responseTime}</span>
                </div>
              </div>
              <div className="flex gap-1 mt-2">
                {driverProfile.specialties.map((specialty, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {specialty}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-electric-600">⭐ {driverProfile.rating}</div>
              <p className="text-xs text-electric-600">Note actuelle</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Navigation Tabs */}
      <div className="grid grid-cols-4 gap-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('available')}
          className={`py-2 px-2 rounded-md text-xs font-medium transition-colors ${
            activeTab === 'available'
              ? 'bg-white text-electric-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Demandes
        </button>
        <button
          onClick={() => setActiveTab('client_requests')}
          className={`py-2 px-2 rounded-md text-xs font-medium transition-colors ${
            activeTab === 'client_requests'
              ? 'bg-white text-electric-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Clients
        </button>
        <button
          onClick={() => setActiveTab('my_offers')}
          className={`py-2 px-2 rounded-md text-xs font-medium transition-colors ${
            activeTab === 'my_offers'
              ? 'bg-white text-electric-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Offres ({myOffers.length})
        </button>
        <button
          onClick={() => setActiveTab('network')}
          className={`py-2 px-2 rounded-md text-xs font-medium transition-colors ${
            activeTab === 'network'
              ? 'bg-white text-electric-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Users className="h-4 w-4 inline mr-1" />
          Réseau
        </button>
      </div>

      {/* Standard Requests */}
      {activeTab === 'available' && (
        <div className="space-y-4">
          {availableRequests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-all duration-200">
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-foreground">{request.customerName}</h4>
                        <Badge className={getUrgencyColor(request.urgency)}>
                          {getUrgencyLabel(request.urgency)}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{request.pickupAddress}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Car className="h-3 w-3" />
                          <span>{request.vehicleModel}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-electric-600">{request.payment}</div>
                      <div className="text-xs text-muted-foreground">{request.estimatedTime}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>📍 {request.distance}</span>
                      <span>🔋 {request.batteryLevel}%</span>
                    </div>
                    <Button 
                      size="sm"
                      onClick={() => handleAcceptRequest(request.id)}
                      className="bg-gradient-to-r from-electric-500 to-electric-600 hover:from-electric-600 hover:to-electric-700"
                    >
                      Accepter
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Client Requests */}
      {activeTab === 'client_requests' && (
        <div className="space-y-4">
          {clientRequests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-all duration-200">
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-foreground">{request.customerName}</h4>
                        <Badge className={getUrgencyColor(request.urgency)}>
                          {getUrgencyLabel(request.urgency)}
                        </Badge>
                        <Badge variant="outline">Demande Client</Badge>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{request.pickupAddress}</span>
                        </div>
                        {request.destinationAddress && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>→ {request.destinationAddress}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Car className="h-3 w-3" />
                          <span>{request.vehicleModel}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span>{request.contactPhone}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-electric-600">{request.proposedPrice}€</div>
                      <div className="text-xs text-muted-foreground">{request.estimatedDuration}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>🔋 {request.batteryLevel}%</span>
                      <span>⏱️ {request.estimatedDuration}</span>
                    </div>
                    
                    {request.notes && (
                      <div className="bg-gray-50 p-2 rounded text-sm">
                        <span className="font-medium">Instructions: </span>
                        {request.notes}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      size="sm"
                      onClick={() => handleAcceptClientRequest(request.id)}
                      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Accepter
                    </Button>
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={() => handleCounterOffer(request.id)}
                      className="border-electric-300 text-electric-700 hover:bg-electric-50"
                    >
                      <Edit3 className="h-3 w-3 mr-1" />
                      Contre-proposition
                    </Button>
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={() => handleRejectClientRequest(request.id)}
                      className="border-red-300 text-red-700 hover:bg-red-50"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Rejeter
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* My Offers Tab */}
      {activeTab === 'my_offers' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Mes offres envoyées</h3>
          {myOffers.length === 0 ? (
            <Card className="bg-gray-50">
              <CardContent className="p-6 text-center">
                <p className="text-gray-600">Aucune offre envoyée pour le moment</p>
              </CardContent>
            </Card>
          ) : (
            myOffers.map((offer) => (
              <Card key={offer.id} className="hover:shadow-md transition-all duration-200">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">Demande #{offer.requestId}</h4>
                        <Badge className={
                          offer.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                          offer.status === 'accepted' ? 'bg-green-100 text-green-700' :
                          'bg-red-100 text-red-700'
                        }>
                          {offer.status === 'sent' ? 'Envoyée' : 
                           offer.status === 'accepted' ? 'Acceptée' : 'Rejetée'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{offer.message}</p>
                      <p className="text-xs text-muted-foreground">
                        Envoyée le {new Date(offer.sentAt).toLocaleString('fr-FR')}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-electric-600">{offer.proposedPrice}€</div>
                      <div className="text-xs text-muted-foreground">{offer.estimatedDuration}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* New Network Tab */}
      {activeTab === 'network' && (
        <NearbyChargersDrivers />
      )}

      {/* Counter Offer Dialog */}
      <Dialog open={showCounterOfferDialog} onOpenChange={setShowCounterOfferDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Faire une contre-proposition</DialogTitle>
            <DialogDescription>
              Proposez vos propres conditions pour cette demande
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newPrice">Nouveau prix (€)</Label>
                <Input
                  id="newPrice"
                  type="number"
                  placeholder="30"
                  value={counterOffer.newPrice}
                  onChange={(e) => setCounterOffer({ ...counterOffer, newPrice: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newDuration">Nouvelle durée</Label>
                <Input
                  id="newDuration"
                  placeholder="3h"
                  value={counterOffer.newDuration}
                  onChange={(e) => setCounterOffer({ ...counterOffer, newDuration: e.target.value })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">Message pour le client</Label>
              <Textarea
                id="message"
                placeholder="Expliquez pourquoi vous proposez ces nouvelles conditions..."
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
            <Button onClick={submitCounterOffer} className="bg-electric-500 hover:bg-electric-600">
              Envoyer la proposition
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-lg font-bold text-blue-600">12</div>
            <p className="text-xs text-muted-foreground">Services effectués</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-lg font-bold text-electric-600">347€</div>
            <p className="text-xs text-muted-foreground">Gains ce mois</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-lg font-bold text-yellow-500">⭐ 4.9</div>
            <p className="text-xs text-muted-foreground">Note moyenne</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DriverService;
