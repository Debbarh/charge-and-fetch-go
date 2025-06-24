import React, { useState, useMemo } from 'react';
import { MapPin, Zap, Car, User, Search, Plus, Clock, Star, Users, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Switch } from '@/components/ui/switch';
import MapView from '@/components/MapView';
import ValetService from '@/components/ValetService';
import DriverService from '@/components/DriverService';
import BookingModal from '@/components/BookingModal';
import { useUserLocation } from '@/hooks/useUserLocation';
import { useChargingStations } from '@/hooks/useChargingStations';
import { formatDistance } from '@/utils/geoUtils';

const Index = () => {
  const [activeTab, setActiveTab] = useState('map');
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // États des filtres
  const [powerFilter, setPowerFilter] = useState<string[]>([]);
  const [connectorFilter, setConnectorFilter] = useState<string[]>([]);
  const [freeOnly, setFreeOnly] = useState(false);
  const [maxDistance, setMaxDistance] = useState<number>(50);
  
  // Géolocalisation de l'utilisateur
  const { userLocation, isLocating, locationError, getCurrentLocation } = useUserLocation();
  
  // Bornes avec distances calculées
  const { stations, isLoading: stationsLoading, error: stationsError } = useChargingStations(userLocation);

  // Filtrer les bornes selon les critères
  const filteredStations = useMemo(() => {
    let filtered = stations;

    // Filtre par distance maximale
    if (userLocation && maxDistance > 0) {
      filtered = filtered.filter(station => 
        !station.distance || station.distance <= maxDistance
      );
    }

    // Filtre par puissance
    if (powerFilter.length > 0) {
      filtered = filtered.filter(station => {
        const power = station.puissance_nominale;
        return powerFilter.some(filter => {
          switch(filter) {
            case 'slow': return power <= 22;
            case 'fast': return power > 22 && power < 50;
            case 'rapid': return power >= 50;
            default: return true;
          }
        });
      });
    }

    // Filtre par type de connecteur
    if (connectorFilter.length > 0) {
      filtered = filtered.filter(station => {
        return connectorFilter.some(connector => {
          switch(connector) {
            case 'type2': return station.prise_type_2;
            case 'ccs': return station.prise_type_combo_ccs;
            case 'chademo': return station.prise_type_chademo;
            default: return true;
          }
        });
      });
    }

    // Filtre gratuit uniquement
    if (freeOnly) {
      filtered = filtered.filter(station => station.gratuit);
    }

    return filtered.slice(0, 20); // Augmenter la limite à 20 résultats
  }, [stations, powerFilter, connectorFilter, freeOnly, maxDistance, userLocation]);

  const tabs = [
    { id: 'map', label: 'Carte', icon: MapPin },
    { id: 'valet', label: 'Client', icon: Car },
    { id: 'driver', label: 'Chauffeur', icon: Users },
    { id: 'bookings', label: 'Historique', icon: Clock },
    { id: 'profile', label: 'Profil', icon: User },
  ];

  // Adapter les bornes pour l'affichage avec les vraies données
  const nearbyStations = filteredStations.map(station => ({
    id: station.id,
    name: station.nom_station,
    operator: station.nom_operateur,
    brand: station.nom_enseigne,
    address: station.adresse_station,
    distance: station.distance ? formatDistance(station.distance) : 'Distance inconnue',
    available: Math.floor(Math.random() * station.nbre_pdc) + 1, // Simulation - à remplacer par données temps réel
    total: station.nbre_pdc,
    price: station.gratuit ? 'Gratuit' : (station.tarification || 'Non spécifié'),
    power: station.puissance_nominale,
    connectors: [
      station.prise_type_2 && 'Type 2',
      station.prise_type_combo_ccs && 'CCS',
      station.prise_type_chademo && 'CHAdeMO'
    ].filter(Boolean).join(', '),
    schedule: station.horaires,
    pmr: station.accessibilite_pmr,
    realData: true // Indicateur que ce sont de vraies données
  }));

  const valetServices = [
    { id: 1, name: 'Express (2h)', price: '25€', rating: 4.8, description: 'Récupération rapide et recharge' },
    { id: 2, name: 'Standard (4h)', price: '15€', rating: 4.9, description: 'Service standard avec lavage' },
    { id: 3, name: 'Nuit (8h+)', price: '35€', rating: 4.7, description: 'Récupération le soir, livraison le matin' },
  ];

  const clearAllFilters = () => {
    setPowerFilter([]);
    setConnectorFilter([]);
    setFreeOnly(false);
    setMaxDistance(50);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'map':
        return (
          <div className="space-y-4">
            {locationError && (
              <div className="mb-4 p-3 bg-orange-100 border border-orange-400 text-orange-700 rounded">
                {locationError}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="ml-2"
                  onClick={getCurrentLocation}
                >
                  Réessayer
                </Button>
              </div>
            )}
            
            {isLocating && (
              <div className="mb-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded">
                Localisation en cours...
              </div>
            )}
            
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une borne de recharge..."
                className="pl-10 bg-white/80 backdrop-blur-sm"
              />
            </div>
            
            <MapView />
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">
                  Bornes à proximité
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    ({filteredStations.length} résultats)
                  </span>
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Filtres
                  {(powerFilter.length > 0 || connectorFilter.length > 0 || freeOnly) && (
                    <span className="bg-electric-500 text-white text-xs px-2 py-1 rounded-full">
                      {powerFilter.length + connectorFilter.length + (freeOnly ? 1 : 0)}
                    </span>
                  )}
                </Button>
              </div>

              {showFilters && (
                <Card className="bg-gradient-to-r from-electric-50 to-blue-50 border-electric-200">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-electric-800">Filtres de recherche</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAllFilters}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Effacer tout
                      </Button>
                    </div>

                    {/* Filtre par puissance */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-electric-700">Puissance de charge</label>
                      <ToggleGroup
                        type="multiple"
                        value={powerFilter}
                        onValueChange={setPowerFilter}
                        className="justify-start flex-wrap"
                      >
                        <ToggleGroupItem value="slow" variant="outline" size="sm">
                          ≤ 22kW (Lente)
                        </ToggleGroupItem>
                        <ToggleGroupItem value="fast" variant="outline" size="sm">
                          22-50kW (Rapide)
                        </ToggleGroupItem>
                        <ToggleGroupItem value="rapid" variant="outline" size="sm">
                          ≥ 50kW (Ultra-rapide)
                        </ToggleGroupItem>
                      </ToggleGroup>
                    </div>

                    {/* Filtre par connecteur */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-electric-700">Type de connecteur</label>
                      <ToggleGroup
                        type="multiple"
                        value={connectorFilter}
                        onValueChange={setConnectorFilter}
                        className="justify-start flex-wrap"
                      >
                        <ToggleGroupItem value="type2" variant="outline" size="sm">
                          Type 2
                        </ToggleGroupItem>
                        <ToggleGroupItem value="ccs" variant="outline" size="sm">
                          CCS
                        </ToggleGroupItem>
                        <ToggleGroupItem value="chademo" variant="outline" size="sm">
                          CHAdeMO
                        </ToggleGroupItem>
                      </ToggleGroup>
                    </div>

                    {/* Filtre distance */}
                    {userLocation && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-electric-700">
                          Distance maximale: {maxDistance} km
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="100"
                          value={maxDistance}
                          onChange={(e) => setMaxDistance(Number(e.target.value))}
                          className="w-full h-2 bg-electric-200 rounded-lg appearance-none cursor-pointer slider"
                        />
                        <div className="flex justify-between text-xs text-electric-600">
                          <span>1 km</span>
                          <span>100 km</span>
                        </div>
                      </div>
                    )}

                    {/* Filtre gratuit */}
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-electric-700">Bornes gratuites uniquement</label>
                      <Switch
                        checked={freeOnly}
                        onCheckedChange={setFreeOnly}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {stationsLoading && (
                <Card className="bg-white/90 backdrop-blur-sm">
                  <CardContent className="p-4 text-center">
                    <p className="text-muted-foreground">Chargement des bornes depuis le GeoJSON...</p>
                  </CardContent>
                </Card>
              )}

              {stationsError && (
                <Card className="bg-red-50 border-red-200">
                  <CardContent className="p-4 text-center">
                    <p className="text-red-600">Erreur: {stationsError}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.reload()}
                      className="mt-2"
                    >
                      Réessayer
                    </Button>
                  </CardContent>
                </Card>
              )}

              {!stationsLoading && !stationsError && nearbyStations.length > 0 ? (
                <div className="space-y-3">
                  {nearbyStations.map((station) => (
                    <Card key={station.id} className="bg-white/90 backdrop-blur-sm hover:bg-white/95 transition-all duration-200 hover:scale-[1.02]">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground">{station.name}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {station.operator} • {station.brand}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {station.address}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {station.distance} • {station.price}
                            </p>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                station.power >= 50 ? 'bg-red-100 text-red-700' :
                                station.power >= 22 ? 'bg-yellow-100 text-yellow-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {station.power} kW
                              </span>
                              {station.connectors && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                  {station.connectors}
                                </span>
                              )}
                              {station.schedule && station.schedule !== 'Non spécifié' && (
                                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                                  <Clock className="h-3 w-3 inline mr-1" />
                                  {station.schedule.length > 20 ? `${station.schedule.substring(0, 20)}...` : station.schedule}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1">
                              <Zap className="h-4 w-4 text-electric-500" />
                              <span className="text-sm font-medium text-electric-600">
                                {station.available}/{station.total}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">disponibles</p>
                            {station.pmr && station.pmr !== 'Non spécifié' && station.pmr.toLowerCase().includes('oui') && (
                              <div className="mt-1">
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                  PMR
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : !stationsLoading && !stationsError && (
                <Card className="bg-white/90 backdrop-blur-sm">
                  <CardContent className="p-4 text-center">
                    <p className="text-muted-foreground">
                      {filteredStations.length === 0 && stations.length > 0 ? 
                       'Aucune borne ne correspond aux filtres sélectionnés' :
                       'Aucune borne trouvée dans le fichier GeoJSON'}
                    </p>
                    {filteredStations.length === 0 && stations.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearAllFilters}
                        className="mt-2"
                      >
                        Effacer les filtres
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        );

      case 'valet':
        return <ValetService services={valetServices} onBooking={() => setIsBookingOpen(true)} />;

      case 'driver':
        return <DriverService />;

      case 'bookings':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Historique</h2>
            <Card className="bg-gradient-to-r from-electric-50 to-blue-50 border-electric-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-electric-800">Valet Express en cours</h3>
                    <p className="text-electric-600 text-sm mt-1">Récupération prévue dans 15 min</p>
                  </div>
                  <div className="animate-pulse-slow">
                    <Car className="h-8 w-8 text-electric-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="text-center py-8">
              <p className="text-muted-foreground">Aucune autre activité récente</p>
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-6">
            <Card className="bg-gradient-to-r from-blue-50 to-electric-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-electric-400 to-blue-400 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Jean Dupont</h3>
                    <p className="text-muted-foreground">jean.dupont@email.com</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-sm text-muted-foreground">4.9 (23 services)</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">Mon véhicule</h3>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Tesla Model 3</h4>
                      <p className="text-sm text-muted-foreground">AB-123-CD</p>
                    </div>
                    <Zap className="h-6 w-6 text-electric-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">Statistiques</h3>
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-electric-600">1,247</div>
                    <p className="text-sm text-muted-foreground">kWh rechargés</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">23</div>
                    <p className="text-sm text-muted-foreground">Services utilisés</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-electric-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-electric-100 sticky top-0 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-electric-600 to-blue-600 bg-clip-text text-transparent">
                ElectricValet
              </h1>
              <p className="text-sm text-muted-foreground">Recharge collaborative</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-electric-200 text-electric-600 hover:bg-electric-50"
              onClick={() => setIsBookingOpen(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Réserver
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4 pb-20">
        {renderContent()}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-electric-100 z-50">
        <div className="grid grid-cols-5 gap-1 p-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <Button
                key={tab.id}
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1 h-16 hover:bg-electric-50 transition-all duration-200 ${
                  isActive 
                    ? 'text-electric-600 bg-electric-50 scale-105' 
                    : 'text-muted-foreground hover:text-electric-600'
                }`}
              >
                <Icon className={`h-5 w-5 transition-transform duration-200 ${isActive ? 'animate-bounce-soft' : ''}`} />
                <span className="text-xs font-medium">{tab.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      <BookingModal 
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)} 
        services={valetServices}
      />
    </div>
  );
};

export default Index;
