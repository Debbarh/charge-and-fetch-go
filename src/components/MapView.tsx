
import React from 'react';
import { MapPin, Zap, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MapView = () => {
  const chargingStations = [
    { id: 1, lat: 48.8566, lng: 2.3522, name: 'Tesla Supercharger', available: 4, total: 8 },
    { id: 2, lat: 48.8606, lng: 2.3376, name: 'Ionity', available: 2, total: 6 },
    { id: 3, lat: 48.8534, lng: 2.3488, name: 'ChargePoint', available: 6, total: 10 },
  ];

  return (
    <div className="relative">
      <div className="bg-gradient-to-br from-electric-100 to-blue-100 rounded-lg h-64 flex items-center justify-center relative overflow-hidden">
        {/* Simulated map background */}
        <div className="absolute inset-0 opacity-30">
          <div className="w-full h-full bg-gradient-to-br from-green-200 via-blue-200 to-purple-200"></div>
          <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
        </div>
        
        {/* Map content */}
        <div className="relative z-10 text-center">
          <MapPin className="h-12 w-12 text-electric-600 mx-auto mb-2 animate-bounce-soft" />
          <p className="text-electric-700 font-medium">Carte Interactive</p>
          <p className="text-electric-600 text-sm">Bornes de recharge à proximité</p>
        </div>

        {/* Charging station markers */}
        {chargingStations.map((station, index) => (
          <div
            key={station.id}
            className={`absolute w-8 h-8 bg-electric-500 rounded-full flex items-center justify-center shadow-lg transform transition-all duration-300 hover:scale-110 cursor-pointer animate-pulse-slow`}
            style={{
              top: `${20 + index * 25}%`,
              left: `${30 + index * 20}%`,
              animationDelay: `${index * 0.5}s`
            }}
          >
            <Zap className="h-4 w-4 text-white" />
          </div>
        ))}

        {/* User location */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse">
          <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping"></div>
        </div>
      </div>

      {/* Map controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <Button size="sm" variant="secondary" className="bg-white/90 backdrop-blur-sm hover:bg-white">
          <Navigation className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="secondary" className="bg-white/90 backdrop-blur-sm hover:bg-white text-xl font-bold px-3">
          +
        </Button>
        <Button size="sm" variant="secondary" className="bg-white/90 backdrop-blur-sm hover:bg-white text-xl font-bold px-3">
          -
        </Button>
      </div>

      {/* Map legend */}
      <div className="mt-4 flex items-center justify-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-electric-500 rounded-full"></div>
          <span className="text-muted-foreground">Bornes disponibles</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-muted-foreground">Votre position</span>
        </div>
      </div>
    </div>
  );
};

export default MapView;
