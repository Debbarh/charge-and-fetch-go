
import React, { useState, useEffect } from 'react';
import { MapPin, Zap, User, Clock, Star, Euro, MessageSquare, CheckCircle, X, Calendar, Users, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useChargingStations } from '../hooks/useChargingStations';
import { useUserLocation } from '../hooks/useUserLocation';

interface NearbyDriver {
  id: number;
  name: string;
  rating: number;
  totalRides: number;
  vehicle: string;
  experience: string;
  distance: number;
  availability: 'available' | 'busy' | 'offline';
  priceRange: string;
  specialties: string[];
  phone: string;
  responseTime: string;
  lastActive: string;
}

interface Negotiation {
  id: number;
  targetId: number;
  targetType: 'driver' | 'station';
  targetName: string;
  proposedPrice: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'counter_offered';
  sentAt: string;
  responseMessage?: string;
  counterPrice?: string;
}

const NearbyChargersDrivers = () => {
  const [activeTab, setActiveTab] = useState<'stations' | 'drivers'>('stations');
  const [negotiations, setNegotiations] = useState<Negotiation[]>([]);
  const [showNegotiationDialog, setShowNegotiationDialog] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<any>(null);
  const [targetType, setTargetType] = useState<'driver' | 'station'>('station');
  const [negotiationForm, setNegotiationForm] = useState({
    proposedPrice: '',
    message: ''
  });
  const [availability, setAvailability] = useState<'available' | 'busy' | 'offline'>('available');
  const { toast } = useToast();
  
  const { userLocation } = useUserLocation();
  const { stations, isLoading } = useChargingStations(userLocation);

  // Simulated nearby drivers data
  const nearbyDrivers: NearbyDriver[] = [
    {
      id: 1,
      name: "Thomas L.",
      rating: 4.8,
      totalRides: 89,
      vehicle: "Peugeot 208",
      experience: "3 ans d'expérience",
      distance: 0.8,
      availability: 'available',
      priceRange: "15-25€",
      specialties: ["Véhicules électriques", "Urgences"],
      phone: "+33 6 12 34 56 78",
      responseTime: "< 3 min",
      lastActive: "En ligne"
    },
    {
      id: 2,
      name: "Sophie M.",
      rating: 4.9,
      totalRides: 156,
      vehicle: "Renault Clio",
      experience: "5 ans d'expérience",
      distance: 1.2,
      availability: 'busy',
      priceRange: "18-30€",
      specialties: ["Longue distance", "VIP"],
      phone: "+33 6 98 76 54 32",
      responseTime: "< 5 min",
      lastActive: "Occupé jusqu'à 16h"
    },
    {
      id: 3,
      name: "Marc D.",
      rating: 4.7,
      totalRides: 203,
      vehicle: "BMW X1",
      experience: "7 ans d'expérience",
      distance: 2.1,
      availability: 'available',
      priceRange: "20-35€",
      specialties: ["Véhicules premium", "Urgences", "Nuit"],
      phone: "+33 6 45 67 89 01",
      responseTime: "< 2 min",
      lastActive: "En ligne"
    }
  ];

  // Load negotiations from localStorage
  useEffect(() => {
    const savedNegotiations = localStorage.getItem('driverNegotiations');
    if (savedNegotiations) {
      setNegotiations(JSON.parse(savedNegotiations));
    }
  }, []);

  const handleNegotiate = (target: any, type: 'driver' | 'station') => {
    setSelectedTarget(target);
    setTargetType(type);
    setShowNegotiationDialog(true);
  };

  const submitNegotiation = () => {
    if (!selectedTarget || !negotiationForm.proposedPrice) return;

    const newNegotiation: Negotiation = {
      id: Date.now(),
      targetId: selectedTarget.id,
      targetType: targetType,
      targetName: targetType === 'driver' ? selectedTarget.name : selectedTarget.nom_station,
      proposedPrice: negotiationForm.proposedPrice,
      message: negotiationForm.message,
      status: 'pending',
      sentAt: new Date().toISOString()
    };

    const updatedNegotiations = [...negotiations, newNegotiation];
    setNegotiations(updatedNegotiations);
    localStorage.setItem('driverNegotiations', JSON.stringify(updatedNegotiations));

    toast({
      title: "Négociation envoyée !",
      description: `Votre proposition a été envoyée à ${newNegotiation.targetName}`,
    });

    setShowNegotiationDialog(false);
    setNegotiationForm({ proposedPrice: '', message: '' });
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'bg-green-100 text-green-700 border-green-200';
      case 'busy': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'offline': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getAvailabilityLabel = (availability: string) => {
    switch (availability) {
      case 'available': return 'Disponible';
      case 'busy': return 'Occupé';
      case 'offline': return 'Hors ligne';
      default: return 'Inconnu';
    }
  };

  const updateAvailability = (newAvailability: 'available' | 'busy' | 'offline') => {
    setAvailability(newAvailability);
    toast({
      title: "Statut mis à jour",
      description: `Votre statut est maintenant: ${getAvailabilityLabel(newAvailability)}`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Réseau de Chauffeurs</h2>
        <p className="text-muted-foreground">Collaborez avec d'autres chauffeurs et négociez l'accès aux bornes</p>
      </div>

      {/* Availability Status Card */}
      <Card className="bg-gradient-to-r from-electric-50 to-blue-50 border-electric-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-electric-800 mb-2">Votre statut de disponibilité</h3>
              <Badge className={getAvailabilityColor(availability)}>
                {getAvailabilityLabel(availability)}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant={availability === 'available' ? 'default' : 'outline'}
                onClick={() => updateAvailability('available')}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                Disponible
              </Button>
              <Button 
                size="sm" 
                variant={availability === 'busy' ? 'default' : 'outline'}
                onClick={() => updateAvailability('busy')}
                className="bg-yellow-500 hover:bg-yellow-600 text-white"
              >
                Occupé
              </Button>
              <Button 
                size="sm" 
                variant={availability === 'offline' ? 'default' : 'outline'}
                onClick={() => updateAvailability('offline')}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Hors ligne
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('stations')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'stations'
              ? 'bg-white text-electric-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Zap className="h-4 w-4 inline mr-2" />
          Bornes à proximité ({stations.length})
        </button>
        <button
          onClick={() => setActiveTab('drivers')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'drivers'
              ? 'bg-white text-electric-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Users className="h-4 w-4 inline mr-2" />
          Chauffeurs ({nearbyDrivers.length})
        </button>
      </div>

      {/* Charging Stations Tab */}
      {activeTab === 'stations' && (
        <div className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-600">Chargement des bornes...</p>
              </CardContent>
            </Card>
          ) : stations.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-gray-600">Aucune borne trouvée à proximité</p>
              </CardContent>
            </Card>
          ) : (
            stations.map((station) => (
              <Card key={station.id} className="hover:shadow-md transition-all duration-200">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-foreground">{station.nom_station}</h4>
                          <Badge className={station.puissance_nominale >= 50 ? 'bg-red-100 text-red-700' : 
                                         station.puissance_nominale >= 22 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}>
                            {station.puissance_nominale} kW
                          </Badge>
                          {station.gratuit && (
                            <Badge className="bg-blue-100 text-blue-700">Gratuit</Badge>
                          )}
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{station.adresse_station}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{station.nom_operateur}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {station.distance && (
                          <div className="text-sm font-medium text-electric-600">
                            {station.distance < 1 ? Math.round(station.distance * 1000) + ' m' : station.distance + ' km'}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>🔌 {station.nbre_pdc} bornes</span>
                        <span>🕒 {station.horaires}</span>
                      </div>
                      <Button 
                        size="sm"
                        onClick={() => handleNegotiate(station, 'station')}
                        className="bg-gradient-to-r from-electric-500 to-electric-600 hover:from-electric-600 hover:to-electric-700"
                      >
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Négocier accès
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Drivers Tab */}
      {activeTab === 'drivers' && (
        <div className="space-y-4">
          {nearbyDrivers.map((driver) => (
            <Card key={driver.id} className="hover:shadow-md transition-all duration-200">
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-foreground">{driver.name}</h4>
                        <Badge className={getAvailabilityColor(driver.availability)}>
                          {getAvailabilityLabel(driver.availability)}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                          <span className="text-sm font-medium">{driver.rating}</span>
                          <span className="text-xs text-muted-foreground">({driver.totalRides})</span>
                        </div>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Car className="h-3 w-3" />
                          <span>{driver.vehicle} • {driver.experience}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>Répond en {driver.responseTime} • {driver.lastActive}</span>
                        </div>
                      </div>
                      <div className="flex gap-1 mt-2">
                        {driver.specialties.map((specialty, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-electric-600">{driver.distance} km</div>
                      <div className="text-xs text-muted-foreground">{driver.priceRange}</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      size="sm"
                      onClick={() => handleNegotiate(driver, 'driver')}
                      disabled={driver.availability === 'offline'}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                    >
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Négocier collaboration
                    </Button>
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(`tel:${driver.phone}`)}
                      className="border-electric-300 text-electric-700 hover:bg-electric-50"
                    >
                      <Phone className="h-3 w-3 mr-1" />
                      Appeler
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Negotiations Dialog */}
      <Dialog open={showNegotiationDialog} onOpenChange={setShowNegotiationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Négocier avec {targetType === 'driver' ? selectedTarget?.name : selectedTarget?.nom_station}
            </DialogTitle>
            <DialogDescription>
              {targetType === 'driver' 
                ? 'Proposez une collaboration avec ce chauffeur'
                : 'Négociez l\'accès à cette borne de recharge'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="proposedPrice">Prix proposé (€)</Label>
              <Input
                id="proposedPrice"
                type="number"
                placeholder="25"
                value={negotiationForm.proposedPrice}
                onChange={(e) => setNegotiationForm({ ...negotiationForm, proposedPrice: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">Message (optionnel)</Label>
              <Textarea
                id="message"
                placeholder={targetType === 'driver' 
                  ? 'Proposez une collaboration ou un échange de services...'
                  : 'Expliquez votre demande d\'accès à cette borne...'
                }
                value={negotiationForm.message}
                onChange={(e) => setNegotiationForm({ ...negotiationForm, message: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNegotiationDialog(false)}>
              Annuler
            </Button>
            <Button onClick={submitNegotiation} className="bg-electric-500 hover:bg-electric-600">
              Envoyer la proposition
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Active Negotiations */}
      {negotiations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Négociations en cours ({negotiations.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {negotiations.map((negotiation) => (
                <div key={negotiation.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{negotiation.targetName}</h4>
                      <p className="text-sm text-muted-foreground">
                        {negotiation.targetType === 'driver' ? 'Collaboration chauffeur' : 'Accès borne'} • {negotiation.proposedPrice}€
                      </p>
                      {negotiation.message && (
                        <p className="text-sm text-gray-600 mt-1">{negotiation.message}</p>
                      )}
                    </div>
                    <Badge className={
                      negotiation.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      negotiation.status === 'accepted' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }>
                      {negotiation.status === 'pending' ? 'En attente' :
                       negotiation.status === 'accepted' ? 'Acceptée' : 'Rejetée'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Envoyée le {new Date(negotiation.sentAt).toLocaleString('fr-FR')}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NearbyChargersDrivers;
