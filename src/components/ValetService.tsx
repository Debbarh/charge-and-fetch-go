
import React from 'react';
import { Car, Clock, Star, MapPin, Euro } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Service {
  id: number;
  name: string;
  price: string;
  rating: number;
  description: string;
}

interface ValetServiceProps {
  services: Service[];
  onBooking: () => void;
}

const ValetService: React.FC<ValetServiceProps> = ({ services, onBooking }) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Service Valet</h2>
        <p className="text-muted-foreground">Nous récupérons votre voiture, la rechargeons et vous la ramenons</p>
      </div>

      {/* How it works */}
      <Card className="bg-gradient-to-r from-electric-50 to-blue-50 border-electric-200">
        <CardHeader>
          <CardTitle className="text-lg text-electric-800">Comment ça marche ?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-electric-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
            <div>
              <h4 className="font-medium text-electric-700">Réservation</h4>
              <p className="text-sm text-electric-600">Choisissez votre service et planifiez</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-electric-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
            <div>
              <h4 className="font-medium text-electric-700">Récupération</h4>
              <p className="text-sm text-electric-600">Notre valet vient chercher votre véhicule</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-electric-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
            <div>
              <h4 className="font-medium text-electric-700">Recharge</h4>
              <p className="text-sm text-electric-600">Recharge complète à la borne optimale</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-electric-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
            <div>
              <h4 className="font-medium text-electric-700">Livraison</h4>
              <p className="text-sm text-electric-600">Retour de votre véhicule rechargé</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services available */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Services disponibles</h3>
        {services.map((service) => (
          <Card key={service.id} className="hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-foreground">{service.name}</h4>
                    <Badge variant="secondary" className="bg-electric-100 text-electric-700 text-xs">
                      <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                      {service.rating}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{service.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Car className="h-4 w-4" />
                      <span>Valet certifié</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>Zone couverte</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right ml-4">
                  <div className="text-2xl font-bold text-electric-600 mb-1">{service.price}</div>
                  <Button 
                    onClick={onBooking}
                    className="bg-gradient-to-r from-electric-500 to-electric-600 hover:from-electric-600 hover:to-electric-700 text-white"
                  >
                    Réserver
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Benefits */}
      <Card className="bg-gradient-to-r from-blue-50 to-electric-50 border-blue-200">
        <CardContent className="p-6">
          <h4 className="font-semibold text-blue-800 mb-4">Pourquoi choisir notre service ?</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-blue-700">Gain de temps</p>
              <p className="text-xs text-blue-600">Pas d'attente</p>
            </div>
            <div className="text-center">
              <Car className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-blue-700">Sécurisé</p>
              <p className="text-xs text-blue-600">Valets certifiés</p>
            </div>
            <div className="text-center">
              <Star className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-blue-700">Qualité</p>
              <p className="text-xs text-blue-600">Service premium</p>
            </div>
            <div className="text-center">
              <Euro className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-blue-700">Transparent</p>
              <p className="text-xs text-blue-600">Prix fixe</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ValetService;
