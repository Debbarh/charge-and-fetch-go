import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Negotiation {
  id: string;
  offerId: string;
  fromUserId: string;
  fromRole: 'client' | 'driver';
  fromUserName: string;
  proposedPrice: number;
  proposedDuration?: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'counter_offered';
  createdAt: string;
}

export const useNegotiations = (offerId?: string) => {
  const [negotiations, setNegotiations] = useState<Negotiation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!offerId) return;

    const loadNegotiations = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .rpc('get_negotiation_history', { p_offer_id: offerId });

        if (error) throw error;

        if (data) {
          setNegotiations(data.map((neg: any) => ({
            id: neg.id,
            offerId: offerId,
            fromUserId: neg.from_user_id,
            fromRole: neg.from_role,
            fromUserName: neg.from_user_name,
            proposedPrice: parseFloat(neg.proposed_price),
            proposedDuration: neg.proposed_duration,
            message: neg.message,
            status: neg.status,
            createdAt: neg.created_at
          })));
        }
      } catch (error: any) {
        console.error('Erreur chargement négociations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadNegotiations();

    // Écoute temps réel
    const channel = supabase
      .channel(`negotiations_${offerId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'negotiations',
          filter: `offer_id=eq.${offerId}`
        },
        () => {
          loadNegotiations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [offerId]);

  const createNegotiation = async (
    userId: string,
    role: 'client' | 'driver',
    price: number,
    message: string,
    duration?: string
  ) => {
    if (!offerId) return;

    try {
      const { error } = await supabase
        .from('negotiations')
        .insert({
          offer_id: offerId,
          from_user_id: userId,
          from_role: role,
          proposed_price: price,
          proposed_duration: duration,
          message: message,
          status: 'pending'
        });

      if (error) throw error;

      // Mettre à jour le statut de l'offre
      await supabase
        .from('driver_offers')
        .update({ 
          status: 'negotiating',
          last_activity: new Date().toISOString()
        })
        .eq('id', offerId);

      toast({
        title: "Négociation envoyée",
        description: "Votre proposition a été envoyée.",
      });

      return true;
    } catch (error: any) {
      console.error('Erreur création négociation:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la négociation.",
        variant: "destructive"
      });
      return false;
    }
  };

  const acceptNegotiation = async (negotiationId: string) => {
    try {
      const { error } = await supabase
        .from('negotiations')
        .update({ status: 'accepted' })
        .eq('id', negotiationId);

      if (error) throw error;

      toast({
        title: "Négociation acceptée",
        description: "La proposition a été acceptée.",
      });

      return true;
    } catch (error: any) {
      console.error('Erreur acceptation:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'accepter la négociation.",
        variant: "destructive"
      });
      return false;
    }
  };

  const rejectNegotiation = async (negotiationId: string) => {
    try {
      const { error } = await supabase
        .from('negotiations')
        .update({ status: 'rejected' })
        .eq('id', negotiationId);

      if (error) throw error;

      toast({
        title: "Négociation rejetée",
        description: "La proposition a été rejetée.",
      });

      return true;
    } catch (error: any) {
      console.error('Erreur rejet:', error);
      toast({
        title: "Erreur",
        description: "Impossible de rejeter la négociation.",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    negotiations,
    isLoading,
    createNegotiation,
    acceptNegotiation,
    rejectNegotiation
  };
};
