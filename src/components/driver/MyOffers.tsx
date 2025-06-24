
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Offer {
  id: number;
  requestId: number;
  status: string;
  proposedPrice: number;
  estimatedDuration: string;
  message: string;
  sentAt: string;
}

interface MyOffersProps {
  offers: Offer[];
}

const MyOffers: React.FC<MyOffersProps> = ({ offers }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Mes offres envoyées</h3>
      {offers.length === 0 ? (
        <Card className="bg-gray-50">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600">Aucune offre envoyée pour le moment</p>
          </CardContent>
        </Card>
      ) : (
        offers.map((offer) => (
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
  );
};

export default MyOffers;
