import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Negotiation {
  id: string;
  from_user_name: string;
  from_role: 'client' | 'driver';
  proposed_price: number;
  proposed_duration?: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

interface NegotiationHistoryProps {
  negotiations: Negotiation[];
}

const NegotiationHistory: React.FC<NegotiationHistoryProps> = ({ negotiations }) => {
  if (!negotiations || negotiations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Historique des négociations</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Aucune négociation pour le moment</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Badge variant="default" className="bg-green-500">Acceptée</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejetée</Badge>;
      default:
        return <Badge variant="secondary">En attente</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Historique des négociations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {negotiations.map((negotiation) => (
          <div
            key={negotiation.id}
            className="border rounded-lg p-4 space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {negotiation.from_user_name}
                </span>
                <Badge variant="outline">
                  {negotiation.from_role === 'driver' ? 'Chauffeur' : 'Client'}
                </Badge>
              </div>
              {getStatusBadge(negotiation.status)}
            </div>

            <div className="flex items-center gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Prix proposé: </span>
                <span className="font-semibold">{negotiation.proposed_price}€</span>
              </div>
              {negotiation.proposed_duration && (
                <div>
                  <span className="text-muted-foreground">Durée: </span>
                  <span className="font-semibold">{negotiation.proposed_duration}</span>
                </div>
              )}
            </div>

            {negotiation.message && (
              <p className="text-sm text-muted-foreground border-l-2 pl-3">
                {negotiation.message}
              </p>
            )}

            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {format(new Date(negotiation.created_at), 'PPp', { locale: fr })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default NegotiationHistory;
