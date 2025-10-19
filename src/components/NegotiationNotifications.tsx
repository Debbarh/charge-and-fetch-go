import React, { useEffect, useState } from 'react';
import { Bell, MessageSquare, Euro } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface PendingNegotiation {
  id: string;
  offerId: string;
  fromUserName: string;
  fromRole: 'client' | 'driver';
  proposedPrice: number;
  message: string;
  createdAt: string;
  requestInfo?: {
    vehicleModel: string;
    pickupAddress: string;
  };
}

const NegotiationNotifications = () => {
  const { user, hasRole } = useAuth();
  const { toast } = useToast();
  const [pendingNegotiations, setPendingNegotiations] = useState<PendingNegotiation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadPendingNegotiations = async () => {
      try {
        setIsLoading(true);

        // Pour un chauffeur
        if (hasRole('chauffeur')) {
          const { data: myOffers } = await supabase
            .from('driver_offers')
            .select('id')
            .eq('driver_id', user.id);

          if (myOffers) {
            const offerIds = myOffers.map(o => o.id);
            
            const { data: negotiations } = await supabase
              .from('negotiations')
              .select(`
                *,
                driver_offers!inner(
                  id,
                  requests!inner(
                    vehicle_model,
                    pickup_address
                  )
                )
              `)
              .in('offer_id', offerIds)
              .eq('from_role', 'client')
              .eq('status', 'pending')
              .order('created_at', { ascending: false })
              .limit(5);

            if (negotiations) {
              setPendingNegotiations(negotiations.map((neg: any) => ({
                id: neg.id,
                offerId: neg.offer_id,
                fromUserName: 'Client',
                fromRole: neg.from_role,
                proposedPrice: parseFloat(neg.proposed_price),
                message: neg.message,
                createdAt: neg.created_at,
                requestInfo: {
                  vehicleModel: neg.driver_offers.requests.vehicle_model,
                  pickupAddress: neg.driver_offers.requests.pickup_address
                }
              })));
            }
          }
        }
        
        // Pour un client
        if (hasRole('client')) {
          const { data: myRequests } = await supabase
            .from('requests')
            .select('id')
            .eq('user_id', user.id);

          if (myRequests) {
            const requestIds = myRequests.map(r => r.id);
            
            const { data: negotiations } = await supabase
              .from('negotiations')
              .select(`
                *,
                driver_offers!inner(
                  id,
                  driver_name,
                  request_id
                )
              `)
              .in('driver_offers.request_id', requestIds)
              .eq('from_role', 'driver')
              .eq('status', 'pending')
              .order('created_at', { ascending: false })
              .limit(5);

            if (negotiations) {
              setPendingNegotiations(negotiations.map((neg: any) => ({
                id: neg.id,
                offerId: neg.offer_id,
                fromUserName: neg.driver_offers.driver_name,
                fromRole: neg.from_role,
                proposedPrice: parseFloat(neg.proposed_price),
                message: neg.message,
                createdAt: neg.created_at
              })));
            }
          }
        }
      } catch (error) {
        console.error('Erreur chargement notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPendingNegotiations();

    // Écoute temps réel
    const channel = supabase
      .channel('negotiation_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'negotiations'
        },
        (payload) => {
          toast({
            title: "Nouvelle négociation !",
            description: `Vous avez reçu une nouvelle proposition de ${payload.new.from_role === 'client' ? 'client' : 'chauffeur'}.`,
          });
          loadPendingNegotiations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, hasRole, toast]);

  if (isLoading || pendingNegotiations.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <Card className="bg-gradient-to-r from-electric-50 to-blue-50 border-electric-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="h-5 w-5 text-electric-600 animate-pulse" />
            <h3 className="font-semibold text-electric-800">
              Négociations en attente ({pendingNegotiations.length})
            </h3>
          </div>

          <div className="space-y-2">
            {pendingNegotiations.slice(0, 3).map((nego) => (
              <div
                key={nego.id}
                className="bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <MessageSquare className="h-4 w-4 text-electric-600" />
                      <span className="font-medium text-sm">
                        {nego.fromUserName}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {nego.fromRole === 'client' ? 'Client' : 'Chauffeur'}
                      </Badge>
                    </div>
                    
                    {nego.requestInfo && (
                      <p className="text-xs text-muted-foreground mb-1">
                        {nego.requestInfo.vehicleModel} • {nego.requestInfo.pickupAddress.substring(0, 30)}...
                      </p>
                    )}
                    
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {nego.message}
                    </p>
                  </div>

                  <div className="text-right ml-4">
                    <div className="flex items-center gap-1 text-electric-600 font-bold">
                      <Euro className="h-4 w-4" />
                      <span>{nego.proposedPrice}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(nego.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {pendingNegotiations.length > 3 && (
              <p className="text-sm text-center text-electric-700 pt-2">
                +{pendingNegotiations.length - 3} autre(s) négociation(s)
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NegotiationNotifications;
