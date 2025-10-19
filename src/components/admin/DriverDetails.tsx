import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Car, Phone, Calendar, Star, Award } from 'lucide-react';

interface DriverDetailsProps {
  verification: any;
  open: boolean;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
}

const DriverDetails = ({ verification, open, onClose, onApprove, onReject }: DriverDetailsProps) => {
  if (!verification) return null;

  const handleReject = () => {
    const reason = prompt('Raison du rejet:');
    if (reason) {
      onReject(verification.id, reason);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Détails de la demande</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Statut */}
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Statut</h3>
            <Badge variant={
              verification.status === 'pending' ? 'default' :
              verification.status === 'approved' ? 'default' : 'destructive'
            }>
              {verification.status === 'pending' ? 'En attente' :
               verification.status === 'approved' ? 'Approuvé' : 'Rejeté'}
            </Badge>
          </div>

          <Separator />

          {/* Informations véhicule */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Car className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold">Véhicule</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 ml-7">
              <div>
                <p className="text-sm text-muted-foreground">Marque</p>
                <p className="font-medium">{verification.vehicle_make}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Modèle</p>
                <p className="font-medium">{verification.vehicle_model}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Année</p>
                <p className="font-medium">{verification.vehicle_year}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Couleur</p>
                <p className="font-medium">{verification.vehicle_color}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground">Immatriculation</p>
                <p className="font-medium">{verification.vehicle_plate}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Expérience */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold">Expérience</h3>
            </div>
            <div className="ml-7">
              <p className="text-sm text-muted-foreground">Années d'expérience</p>
              <p className="font-medium">{verification.experience_years} ans</p>
            </div>
          </div>

          {/* Tarif */}
          {verification.hourly_rate && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="font-semibold">Tarif horaire</h3>
                <p className="text-2xl font-bold text-primary">{verification.hourly_rate} €/h</p>
              </div>
            </>
          )}

          {/* Bio */}
          {verification.bio && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="font-semibold">Présentation</h3>
                <p className="text-muted-foreground">{verification.bio}</p>
              </div>
            </>
          )}

          {/* Dates */}
          <Separator />
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold">Dates</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 ml-7">
              <div>
                <p className="text-sm text-muted-foreground">Créée le</p>
                <p className="font-medium">
                  {new Date(verification.created_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
              {verification.verified_at && (
                <div>
                  <p className="text-sm text-muted-foreground">Approuvée le</p>
                  <p className="font-medium">
                    {new Date(verification.verified_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              )}
              {verification.rejected_at && (
                <div>
                  <p className="text-sm text-muted-foreground">Rejetée le</p>
                  <p className="font-medium">
                    {new Date(verification.rejected_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Raison de rejet */}
          {verification.rejection_reason && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="font-semibold text-destructive">Raison du rejet</h3>
                <p className="text-muted-foreground">{verification.rejection_reason}</p>
              </div>
            </>
          )}

          {/* Actions */}
          {verification.status === 'pending' && (
            <>
              <Separator />
              <div className="flex gap-3">
                <Button 
                  onClick={() => onApprove(verification.id)}
                  className="flex-1"
                >
                  Approuver
                </Button>
                <Button 
                  onClick={handleReject}
                  variant="destructive"
                  className="flex-1"
                >
                  Rejeter
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DriverDetails;
