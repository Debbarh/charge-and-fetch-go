
import React from 'react';
import { MapPin, Car } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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

interface AvailableRequestsProps {
  requests: DriverRequest[];
  onAcceptRequest: (requestId: number) => void;
  getUrgencyColor: (urgency: string) => string;
  getUrgencyLabel: (urgency: string) => string;
}

const AvailableRequests: React.FC<AvailableRequestsProps> = ({
  requests,
  onAcceptRequest,
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
                  onClick={() => onAcceptRequest(request.id)}
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
  );
};

export default AvailableRequests;
