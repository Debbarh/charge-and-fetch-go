
import React, { useState } from 'react';
import { User, Car, Users, Home, Zap, MapPin, Euro, Clock, Star, Plus, Edit3, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  rating: number;
  totalServices: number;
  monthlyEarnings: number;
}

interface ChargingStationHost {
  id: number;
  address: string;
  powerOutput: string;
  connectorTypes: string[];
  pricing: string;
  availability: string;
  amenities: string[];
  description: string;
  isActive: boolean;
  bookings: number;
  rating: number;
}

const ProfileManagement = () => {
  const [activeRole, setActiveRole] = useState<'client' | 'driver' | 'host'>('client');
  const [isDriver, setIsDriver] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [showAddStationDialog, setShowAddStationDialog] = useState(false);
  const [showEditProfileDialog, setShowEditProfileDialog] = useState(false);
  const { toast } = useToast();

  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Jean Dupont',
    email: 'jean.dupont@email.com',
    phone: '+33 6 12 34 56 78',
    rating: 4.9,
    totalServices: 23,
    monthlyEarnings: 347
  });

  const [newStation, setNewStation] = useState({
    address: '',
    powerOutput: '',
    connectorTypes: [] as string[],
    pricing: '',
    availability: '',
    amenities: [] as string[],
    description: ''
  });

  const [hostStations, setHostStations] = useState<ChargingStationHost[]>([
    {
      id: 1,
      address: '15 Rue de la République, Paris 11ème',
      powerOutput: '7.4kW',
      connectorTypes: ['Type 2'],
      pricing: '0.25€/kWh',
      availability: '24h/24',
      amenities: ['WiFi', 'Parking sécurisé', 'Café à proximité'],
      description: 'Borne dans garage privé, accès facile, quartier calme',
      isActive: true,
      bookings: 48,
      rating: 4.8
    }
  ]);

  const handleBecomeDriver = () => {
    setIsDriver(true);
    toast({
      title: "Profil chauffeur activé !",
      description: "Vous pouvez maintenant accepter des demandes de valet.",
    });
  };

  const handleBecomeHost = () => {
    setIsHost(true);
    toast({
      title: "Profil hôte activé !",
      description: "Vous pouvez maintenant proposer votre borne électrique.",
    });
  };

  const handleAddStation = () => {
    const station: ChargingStationHost = {
      id: Date.now(),
      ...newStation,
      isActive: true,
      bookings: 0,
      rating: 0
    };
    setHostStations([...hostStations, station]);
    setNewStation({
      address: '',
      powerOutput: '',
      connectorTypes: [],
      pricing: '',
      availability: '',
      amenities: [],
      description: ''
    });
    setShowAddStationDialog(false);
    toast({
      title: "Borne ajoutée !",
      description: "Votre borne est maintenant disponible à la location.",
    });
  };

  const toggleStationStatus = (stationId: number) => {
    setHostStations(stations => 
      stations.map(station => 
        station.id === stationId 
          ? { ...station, isActive: !station.isActive }
          : station
      )
    );
    toast({
      title: "Statut mis à jour",
      description: "Le statut de votre borne a été modifié.",
    });
  };

  const handleConnectorToggle = (connector: string) => {
    setNewStation(prev => ({
      ...prev,
      connectorTypes: prev.connectorTypes.includes(connector)
        ? prev.connectorTypes.filter(c => c !== connector)
        : [...prev.connectorTypes, connector]
    }));
  };

  const handleAmenityToggle = (amenity: string) => {
    setNewStation(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'client': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'driver': return 'bg-electric-100 text-electric-700 border-electric-200';
      case 'host': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const activeRoles = [
    'client',
    ...(isDriver ? ['driver'] : []),
    ...(isHost ? ['host'] : [])
  ];

  return (
    <div className="space-y-6">
      {/* Header avec profil principal */}
      <Card className="bg-gradient-to-r from-blue-50 to-electric-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-electric-400 to-blue-400 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{userProfile.name}</h3>
                <p className="text-muted-foreground">{userProfile.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-sm text-muted-foreground">
                    {userProfile.rating} ({userProfile.totalServices} services)
                  </span>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEditProfileDialog(true)}
            >
              <Edit3 className="h-4 w-4 mr-1" />
              Modifier
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sélection des rôles actifs */}
      <Card>
        <CardHeader>
          <CardTitle>Mes Rôles</CardTitle>
          <CardDescription>Gérez vos différents profils sur la plateforme</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {activeRoles.map((role) => (
              <button
                key={role}
                onClick={() => setActiveRole(role as any)}
                className={`px-3 py-2 rounded-full text-sm font-medium border transition-colors ${
                  activeRole === role 
                    ? getRoleColor(role) 
                    : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                }`}
              >
                {role === 'client' && <User className="h-4 w-4 inline mr-1" />}
                {role === 'driver' && <Car className="h-4 w-4 inline mr-1" />}
                {role === 'host' && <Home className="h-4 w-4 inline mr-1" />}
                {role === 'client' ? 'Client' : role === 'driver' ? 'Chauffeur' : 'Hôte'}
              </button>
            ))}
          </div>

          {/* Actions pour devenir chauffeur ou hôte */}
          <div className="flex gap-3">
            {!isDriver && (
              <Button
                variant="outline"
                onClick={handleBecomeDriver}
                className="border-electric-300 text-electric-700 hover:bg-electric-50"
              >
                <Users className="h-4 w-4 mr-2" />
                Devenir Chauffeur
              </Button>
            )}
            {!isHost && (
              <Button
                variant="outline"
                onClick={handleBecomeHost}
                className="border-green-300 text-green-700 hover:bg-green-50"
              >
                <Home className="h-4 w-4 mr-2" />
                Devenir Hôte de Borne
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contenu selon le rôle sélectionné */}
      {activeRole === 'client' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Profil Client</h3>
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{userProfile.totalServices}</div>
                <p className="text-sm text-muted-foreground">Services utilisés</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-electric-600">1,247</div>
                <p className="text-sm text-muted-foreground">kWh rechargés</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">-45€</div>
                <p className="text-sm text-muted-foreground">Économisé ce mois</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeRole === 'driver' && isDriver && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Profil Chauffeur</h3>
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-electric-600">{userProfile.monthlyEarnings}€</div>
                <p className="text-sm text-muted-foreground">Gains ce mois</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">12</div>
                <p className="text-sm text-muted-foreground">Services effectués</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-500">⭐ {userProfile.rating}</div>
                <p className="text-sm text-muted-foreground">Note moyenne</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeRole === 'host' && isHost && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Mes Bornes de Recharge</h3>
            <Button
              onClick={() => setShowAddStationDialog(true)}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une borne
            </Button>
          </div>

          {hostStations.length > 0 ? (
            <div className="space-y-4">
              {hostStations.map((station) => (
                <Card key={station.id} className="hover:shadow-md transition-all duration-200">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-foreground">Borne Domicile</h4>
                            <Badge className={station.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                              {station.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{station.address}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Zap className="h-3 w-3" />
                              <span>{station.powerOutput} • {station.connectorTypes.join(', ')}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Euro className="h-3 w-3" />
                              <span>{station.pricing}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{station.availability}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">{station.bookings}</div>
                          <div className="text-xs text-muted-foreground">réservations</div>
                          {station.rating > 0 && (
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                              <span className="text-xs">{station.rating}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {station.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {station.amenities.map((amenity, index) => (
                            <span key={index} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                              {amenity}
                            </span>
                          ))}
                        </div>
                      )}

                      {station.description && (
                        <p className="text-sm text-muted-foreground bg-gray-50 p-2 rounded">
                          {station.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Status:</span>
                          <Switch
                            checked={station.isActive}
                            onCheckedChange={() => toggleStationStatus(station.id)}
                          />
                        </div>
                        <Button variant="outline" size="sm">
                          <Settings className="h-3 w-3 mr-1" />
                          Modifier
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <Home className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="font-medium text-foreground mb-2">Aucune borne enregistrée</h4>
                <p className="text-muted-foreground mb-4">
                  Ajoutez votre borne électrique pour commencer à gagner de l'argent
                </p>
                <Button
                  onClick={() => setShowAddStationDialog(true)}
                  className="bg-gradient-to-r from-green-500 to-green-600"
                >
                  Ajouter ma première borne
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Dialog pour ajouter une borne */}
      <Dialog open={showAddStationDialog} onOpenChange={setShowAddStationDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter une borne de recharge</DialogTitle>
            <DialogDescription>
              Renseignez les informations de votre borne électrique
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                placeholder="15 Rue de la République, Paris"
                value={newStation.address}
                onChange={(e) => setNewStation({ ...newStation, address: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="power">Puissance</Label>
                <Input
                  id="power"
                  placeholder="7.4kW"
                  value={newStation.powerOutput}
                  onChange={(e) => setNewStation({ ...newStation, powerOutput: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pricing">Tarif</Label>
                <Input
                  id="pricing"
                  placeholder="0.25€/kWh"
                  value={newStation.pricing}
                  onChange={(e) => setNewStation({ ...newStation, pricing: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Types de connecteurs</Label>
              <div className="flex gap-2">
                {['Type 2', 'CCS', 'CHAdeMO'].map((connector) => (
                  <Button
                    key={connector}
                    type="button"
                    variant={newStation.connectorTypes.includes(connector) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleConnectorToggle(connector)}
                  >
                    {connector}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="availability">Disponibilité</Label>
              <Input
                id="availability"
                placeholder="24h/24, 8h-20h..."
                value={newStation.availability}
                onChange={(e) => setNewStation({ ...newStation, availability: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Services inclus</Label>
              <div className="flex flex-wrap gap-2">
                {['WiFi', 'Parking sécurisé', 'Café à proximité', 'Toilettes', 'Assistance'].map((amenity) => (
                  <Button
                    key={amenity}
                    type="button"
                    variant={newStation.amenities.includes(amenity) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleAmenityToggle(amenity)}
                  >
                    {amenity}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Informations supplémentaires sur l'accès, le quartier..."
                value={newStation.description}
                onChange={(e) => setNewStation({ ...newStation, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddStationDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddStation} className="bg-green-500 hover:bg-green-600">
              Ajouter la borne
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog pour modifier le profil */}
      <Dialog open={showEditProfileDialog} onOpenChange={setShowEditProfileDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier mon profil</DialogTitle>
            <DialogDescription>
              Mettez à jour vos informations personnelles
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom complet</Label>
              <Input
                id="name"
                value={userProfile.name}
                onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={userProfile.email}
                onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                type="tel"
                value={userProfile.phone}
                onChange={(e) => setUserProfile({ ...userProfile, phone: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditProfileDialog(false)}>
              Annuler
            </Button>
            <Button onClick={() => {
              setShowEditProfileDialog(false);
              toast({
                title: "Profil mis à jour !",
                description: "Vos informations ont été sauvegardées.",
              });
            }}>
              Sauvegarder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfileManagement;
