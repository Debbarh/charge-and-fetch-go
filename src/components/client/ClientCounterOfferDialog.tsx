import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { DollarSign } from 'lucide-react';

interface ClientCounterOfferDialogProps {
  offerId: string;
  currentPrice: number;
  requestId: string;
  onSuccess?: () => void;
}

const ClientCounterOfferDialog: React.FC<ClientCounterOfferDialogProps> = ({
  offerId,
  currentPrice,
  requestId,
  onSuccess,
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [proposedPrice, setProposedPrice] = useState(currentPrice.toString());
  const [proposedDuration, setProposedDuration] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const price = parseFloat(proposedPrice);
    if (isNaN(price) || price <= 0) {
      toast.error('Veuillez entrer un prix valide');
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Vous devez être connecté');
        return;
      }

      // Vérifier que la demande appartient bien à l'utilisateur
      const { data: request } = await supabase
        .from('requests')
        .select('user_id')
        .eq('id', requestId)
        .single();

      if (!request || request.user_id !== user.id) {
        toast.error('Vous ne pouvez pas négocier sur cette offre');
        return;
      }

      // Créer la contre-offre
      const { error } = await supabase.from('negotiations').insert({
        offer_id: offerId,
        from_user_id: user.id,
        from_role: 'client',
        proposed_price: price,
        proposed_duration: proposedDuration || null,
        message: message || 'Contre-proposition du client',
        status: 'pending',
      });

      if (error) throw error;

      toast.success('Contre-offre envoyée avec succès');
      setOpen(false);
      setProposedPrice(currentPrice.toString());
      setProposedDuration('');
      setMessage('');
      onSuccess?.();
    } catch (error) {
      console.error('Erreur lors de la contre-offre:', error);
      toast.error('Impossible d\'envoyer la contre-offre');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <DollarSign className="h-4 w-4" />
          Négocier
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Faire une contre-offre</DialogTitle>
          <DialogDescription>
            Proposez un nouveau prix ou une durée différente au chauffeur
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="price">Nouveau prix proposé (€)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={proposedPrice}
              onChange={(e) => setProposedPrice(e.target.value)}
              placeholder="Ex: 45.00"
              required
            />
            <p className="text-xs text-muted-foreground">
              Prix actuel: {currentPrice}€
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Durée estimée (optionnel)</Label>
            <Input
              id="duration"
              type="text"
              value={proposedDuration}
              onChange={(e) => setProposedDuration(e.target.value)}
              placeholder="Ex: 2-3 heures"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message (optionnel)</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Expliquez votre contre-proposition..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Envoi...' : 'Envoyer la contre-offre'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ClientCounterOfferDialog;
