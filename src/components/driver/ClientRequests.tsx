
import React from 'react';
import { MapPin, Car, Phone, CheckCircle, Edit3, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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

interface ClientRequestsProps {
  requests: ClientRequest[];
  onAcceptRequest: (requestId: number) => void;
  onRejectRequest: (requestId: number) => void;
  onCounterOffer: (requestId: number) => void;
  getUrgencyColor: (urgency: string) => string;
  getUrgencyLabel: (urgency: string) => string;
}

const ClientRequests: React.FC<ClientRequestsProps> = ({
  requests,
  onAcceptRequest,
  onRejectRequest,
  onCounterOffer,
  getUrgencyColor,
  getUrgencyLabel
}) => {
  return (
    <div className="space-y-4">
      {requests.map((request) => (
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
                  onClick={() => onAcceptRequest(request.id)}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Accepter
                </Button>
                <Button 
                  size="sm"
                  variant="outline"
                  onClick={() => onCounterOffer(request.id)}
                  className="border-electric-300 text-electric-700 hover:bg-electric-50"
                >
                  <Edit3 className="h-3 w-3 mr-1" />
                  Contre-proposition
                </Button>
                <Button 
                  size="sm"
                  variant="outline"
                  onClick={() => onRejectRequest(request.id)}
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
  );
};

export default ClientRequests;
