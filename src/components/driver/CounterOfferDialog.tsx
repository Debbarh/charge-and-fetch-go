
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface CounterOfferDialogProps {
  isOpen: boolean;
  onClose: () => void;
  counterOffer: {
    requestId: string;
    newPrice: string;
    newDuration: string;
    message: string;
  };
  setCounterOffer: (offer: any) => void;
  onSubmit: () => void;
}

const CounterOfferDialog: React.FC<CounterOfferDialogProps> = ({
  isOpen,
  onClose,
  counterOffer,
  setCounterOffer,
  onSubmit
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Faire une contre-proposition</DialogTitle>
          <DialogDescription>
            Proposez vos propres conditions pour cette demande
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="newPrice">Nouveau prix (€)</Label>
              <Input
                id="newPrice"
                type="number"
                placeholder="30"
                value={counterOffer.newPrice}
                onChange={(e) => setCounterOffer({ ...counterOffer, newPrice: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newDuration">Nouvelle durée</Label>
              <Input
                id="newDuration"
                placeholder="3h"
                value={counterOffer.newDuration}
                onChange={(e) => setCounterOffer({ ...counterOffer, newDuration: e.target.value })}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message">Message pour le client</Label>
            <Textarea
              id="message"
              placeholder="Expliquez pourquoi vous proposez ces nouvelles conditions..."
              value={counterOffer.message}
              onChange={(e) => setCounterOffer({ ...counterOffer, message: e.target.value })}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={onSubmit} className="bg-electric-500 hover:bg-electric-600">
            Envoyer la proposition
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CounterOfferDialog;
