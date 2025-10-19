import React, { useState } from 'react';
import { Star, Send } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RatingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requestId: string;
  offerId: string;
  driverId: string;
  driverName: string;
  onRatingSubmitted?: () => void;
}

const RatingModal = ({
  open,
  onOpenChange,
  requestId,
  offerId,
  driverId,
  driverName,
  onRatingSubmitted
}: RatingModalProps) => {
  const [overallRating, setOverallRating] = useState(0);
  const [punctualityRating, setPunctualityRating] = useState(0);
  const [communicationRating, setCommunicationRating] = useState(0);
  const [vehicleConditionRating, setVehicleConditionRating] = useState(0);
  const [professionalismRating, setProfessionalismRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (overallRating === 0) {
      toast.error('Veuillez donner une note globale');
      return;
    }

    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const { error } = await supabase
        .from('ratings')
        .insert({
          request_id: requestId,
          offer_id: offerId,
          driver_id: driverId,
          client_id: user.id,
          overall_rating: overallRating,
          punctuality_rating: punctualityRating || null,
          communication_rating: communicationRating || null,
          vehicle_condition_rating: vehicleConditionRating || null,
          professionalism_rating: professionalismRating || null,
          comment: comment || null
        });

      if (error) throw error;

      toast.success('Évaluation envoyée avec succès !');
      onOpenChange(false);
      onRatingSubmitted?.();
      
      // Reset form
      setOverallRating(0);
      setPunctualityRating(0);
      setCommunicationRating(0);
      setVehicleConditionRating(0);
      setProfessionalismRating(0);
      setComment('');
    } catch (error) {
      console.error('Erreur envoi évaluation:', error);
      toast.error('Impossible d\'envoyer l\'évaluation');
    } finally {
      setSubmitting(false);
    }
  };

  const StarRating = ({ 
    value, 
    onChange, 
    label 
  }: { 
    value: number; 
    onChange: (val: number) => void; 
    label: string;
  }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            <Star
              className={`h-8 w-8 ${
                star <= value
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Évaluer {driverName}</DialogTitle>
          <DialogDescription>
            Votre avis nous aide à améliorer la qualité du service
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <StarRating
            value={overallRating}
            onChange={setOverallRating}
            label="Note globale *"
          />

          <StarRating
            value={punctualityRating}
            onChange={setPunctualityRating}
            label="Ponctualité"
          />

          <StarRating
            value={communicationRating}
            onChange={setCommunicationRating}
            label="Communication"
          />

          <StarRating
            value={vehicleConditionRating}
            onChange={setVehicleConditionRating}
            label="État du véhicule"
          />

          <StarRating
            value={professionalismRating}
            onChange={setProfessionalismRating}
            label="Professionnalisme"
          />

          <div className="space-y-2">
            <Label htmlFor="comment">Commentaire (optionnel)</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Partagez votre expérience..."
              rows={4}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
            disabled={submitting}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1"
            disabled={submitting || overallRating === 0}
          >
            <Send className="h-4 w-4 mr-2" />
            Envoyer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RatingModal;
