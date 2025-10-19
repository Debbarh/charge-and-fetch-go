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

interface DriverProfile {
  name: string;
  phone: string;
  experience_years: number;
  vehicle_type: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: number;
  vehicle_color: string;
  vehicle_plate: string;
  bio: string;
  hourly_rate: number;
  rating: number;
  totalRides: number;
  completionRate: number;
  responseTime: string;
  specialties: string[];
  availability_schedule: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
}

const ProfileManagement = () => {
  const [activeRole, setActiveRole] = useState<'client' | 'driver' | 'host'>('client');
  const [isDriver, setIsDriver] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [showAddStationDialog, setShowAddStationDialog] = useState(false);
  const [showEditProfileDialog, setShowEditProfileDialog] = useState(false);
  const [showDriverRegistrationDialog, setShowDriverRegistrationDialog] = useState(false);
  const { toast } = useToast();

  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Jean Dupont',
    email: 'jean.dupont@email.com',
    phone: '+33 6 12 34 56 78',
    rating: 4.9,
    totalServices: 23,
    monthlyEarnings: 347
  });

  const [driverProfile, setDriverProfile] = useState<DriverProfile>({
    name: '',
    phone: '',
    experience_years: 0,
    vehicle_type: '',
    vehicle_make: '',
    vehicle_model: '',
    vehicle_year: new Date().getFullYear(),
    vehicle_color: '',
    vehicle_plate: '',
    bio: '',
    hourly_rate: 0,
    rating: 4.9,
    totalRides: 127,
    completionRate: 98,
    responseTime: '< 5 min',
    specialties: ['Véhicules électriques', 'Urgences', 'Longue distance'],
    availability_schedule: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: true,
      sunday: true
    }
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

  const handleBecomeDriver = (e: React.FormEvent) => {
    e.preventDefault();
    setIsDriver(true);
    setShowDriverRegistrationDialog(false);
    toast({
      title: "Inscription validée !",
      description: "Vous êtes maintenant chauffeur-valet. Vous pouvez voir les demandes disponibles.",
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
                onClick={() => setShowDriverRegistrationDialog(true)}
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
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Profil Chauffeur</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEditProfileDialog(true)}
            >
              <Edit3 className="h-4 w-4 mr-1" />
              Modifier le profil
            </Button>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-electric-600">{userProfile.monthlyEarnings}€</div>
                <p className="text-sm text-muted-foreground">Gains ce mois</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{driverProfile.totalRides}</div>
                <p className="text-sm text-muted-foreground">Services effectués</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-500">⭐ {driverProfile.rating}</div>
                <p className="text-sm text-muted-foreground">Note moyenne</p>
              </CardContent>
            </Card>
          </div>

          {/* Vehicle Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Car className="h-5 w-5" />
                Informations du Véhicule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Type de véhicule</p>
                  <p className="font-medium">{driverProfile.vehicle_type || 'Non renseigné'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Marque & Modèle</p>
                  <p className="font-medium">
                    {driverProfile.vehicle_make && driverProfile.vehicle_model
                      ? `${driverProfile.vehicle_make} ${driverProfile.vehicle_model}`
                      : 'Non renseigné'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Année</p>
                  <p className="font-medium">{driverProfile.vehicle_year || 'Non renseigné'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Couleur</p>
                  <p className="font-medium">{driverProfile.vehicle_color || 'Non renseigné'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Immatriculation</p>
                  <p className="font-medium">{driverProfile.vehicle_plate || 'Non renseigné'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tarif horaire</p>
                  <p className="font-medium text-electric-600">
                    {driverProfile.hourly_rate ? `${driverProfile.hourly_rate}€/h` : 'Non défini'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Availability Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Disponibilités
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {Object.entries(driverProfile.availability_schedule).map(([day, available]) => (
                  <div
                    key={day}
                    className={`text-center p-2 rounded ${
                      available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    <p className="text-xs font-medium capitalize">{day.slice(0, 3)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Specialties and Experience */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Expérience & Spécialités</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Années d'expérience</p>
                <p className="font-medium">{driverProfile.experience_years} ans</p>
              </div>
              {driverProfile.bio && (
                <div>
                  <p className="text-sm text-muted-foreground">Bio</p>
                  <p className="text-sm">{driverProfile.bio}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground mb-2">Spécialités</p>
                <div className="flex flex-wrap gap-2">
                  {driverProfile.specialties.map((specialty, index) => (
                    <Badge key={index} variant="outline" className="bg-electric-50">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
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

      {/* Dialog pour devenir chauffeur */}
      <Dialog open={showDriverRegistrationDialog} onOpenChange={setShowDriverRegistrationDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Inscription Chauffeur</DialogTitle>
            <DialogDescription>
              Remplissez ce formulaire pour devenir chauffeur-valet
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleBecomeDriver} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="driver-name">Nom complet</Label>
              <Input
                id="driver-name"
                placeholder="Jean Dupont"
                value={driverProfile.name}
                onChange={(e) => setDriverProfile({ ...driverProfile, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="driver-phone">Téléphone</Label>
              <Input
                id="driver-phone"
                type="tel"
                placeholder="+33 6 12 34 56 78"
                value={driverProfile.phone}
                onChange={(e) => setDriverProfile({ ...driverProfile, phone: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="driver-bio">Bio / Présentation</Label>
              <Textarea
                id="driver-bio"
                placeholder="Parlez de votre expérience..."
                value={driverProfile.bio}
                onChange={(e) => setDriverProfile({ ...driverProfile, bio: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="experience-years">Années d'expérience</Label>
                <Input
                  id="experience-years"
                  type="number"
                  min="0"
                  placeholder="5"
                  value={driverProfile.experience_years || ''}
                  onChange={(e) => setDriverProfile({ ...driverProfile, experience_years: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hourly-rate">Tarif horaire (€)</Label>
                <Input
                  id="hourly-rate"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="25.00"
                  value={driverProfile.hourly_rate || ''}
                  onChange={(e) => setDriverProfile({ ...driverProfile, hourly_rate: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicle-type">Type de véhicule</Label>
              <Input
                id="vehicle-type"
                placeholder="Berline, SUV, Camionnette..."
                value={driverProfile.vehicle_type}
                onChange={(e) => setDriverProfile({ ...driverProfile, vehicle_type: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vehicle-make">Marque</Label>
                <Input
                  id="vehicle-make"
                  placeholder="Tesla, Renault..."
                  value={driverProfile.vehicle_make}
                  onChange={(e) => setDriverProfile({ ...driverProfile, vehicle_make: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicle-model">Modèle</Label>
                <Input
                  id="vehicle-model"
                  placeholder="Model 3, Zoe..."
                  value={driverProfile.vehicle_model}
                  onChange={(e) => setDriverProfile({ ...driverProfile, vehicle_model: e.target.value })}
                  required
              />
            </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vehicle-year">Année</Label>
                <Input
                  id="vehicle-year"
                  type="number"
                  min="1990"
                  max={new Date().getFullYear() + 1}
                  placeholder="2023"
                  value={driverProfile.vehicle_year || ''}
                  onChange={(e) => setDriverProfile({ ...driverProfile, vehicle_year: parseInt(e.target.value) || new Date().getFullYear() })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicle-color">Couleur</Label>
                <Input
                  id="vehicle-color"
                  placeholder="Noir, Blanc..."
                  value={driverProfile.vehicle_color}
                  onChange={(e) => setDriverProfile({ ...driverProfile, vehicle_color: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicle-plate">Immatriculation</Label>
                <Input
                  id="vehicle-plate"
                  placeholder="AB-123-CD"
                  value={driverProfile.vehicle_plate}
                  onChange={(e) => setDriverProfile({ ...driverProfile, vehicle_plate: e.target.value.toUpperCase() })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Disponibilités</Label>
              <div className="grid grid-cols-7 gap-2">
                {Object.entries(driverProfile.availability_schedule).map(([day, available]) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setDriverProfile({
                      ...driverProfile,
                      availability_schedule: {
                        ...driverProfile.availability_schedule,
                        [day]: !available
                      }
                    })}
                    className={`p-2 rounded text-xs font-medium transition-colors ${
                      available 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {day.slice(0, 3).toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDriverRegistrationDialog(false)}>
                Annuler
              </Button>
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-blue-500 to-electric-500 hover:from-blue-600 hover:to-electric-600"
              >
                <User className="h-4 w-4 mr-2" />
                Devenir Chauffeur-Valet
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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
