
import React, { useState } from 'react';
import { Car, MapPin, Clock, Star, Euro, User, Phone, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

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

const DriverService = () => {
  const [isDriver, setIsDriver] = useState(false);
  const [driverProfile, setDriverProfile] = useState({
    name: '',
    phone: '',
    experience: '',
    vehicle: '',
    notes: ''
  });
  const { toast } = useToast();

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
    },
    {
      id: 3,
      customerName: "Sophie M.",
      pickupAddress: "78 Boulevard Saint-Germain, Paris",
      returnAddress: "78 Boulevard Saint-Germain, Paris",
      vehicleModel: "Peugeot e-208",
      estimatedTime: "4h",
      payment: "35€",
      distance: "2.1 km",
      batteryLevel: 8,
      urgency: 'high'
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
    toast({
      title: "Demande acceptée !",
      description: "Le client a été notifié. Dirigez-vous vers l'adresse de récupération.",
    });
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

        {/* Benefits */}
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
          </Card>
        </Card>

        {/* Registration form */}
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
        <h2 className="text-2xl font-bold text-foreground mb-2">Demandes Disponibles</h2>
        <p className="text-muted-foreground">Choisissez les services qui vous conviennent</p>
      </div>

      {/* Driver stats */}
      <Card className="bg-gradient-to-r from-electric-50 to-blue-50 border-electric-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-electric-800">Bienvenue, {driverProfile.name || 'Chauffeur'} !</h3>
              <p className="text-electric-600 text-sm">Prêt pour de nouveaux services</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-electric-600">⭐ 4.9</div>
              <p className="text-xs text-electric-600">Note moyenne</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available requests */}
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

      {/* Quick stats */}
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
