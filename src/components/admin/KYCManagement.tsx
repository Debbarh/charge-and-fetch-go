import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Clock, Eye, Car, Calendar } from 'lucide-react';
import DriverDetails from './DriverDetails';

interface Verification {
  id: string;
  user_id: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: number;
  vehicle_color: string;
  vehicle_plate: string;
  experience_years: number;
  hourly_rate: number | null;
  bio: string | null;
  status: string;
  created_at: string;
  verified_at: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
  reviewed_by: string | null;
}

const KYCManagement = () => {
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState<Verification | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadVerifications();

    // Écouter les changements en temps réel
    const channel = supabase
      .channel('driver_verifications_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'driver_verifications'
        },
        () => {
          loadVerifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadVerifications = async () => {
    try {
      const { data, error } = await supabase
        .from('driver_verifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVerifications(data || []);
    } catch (error: any) {
      console.error('Erreur chargement vérifications:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de charger les demandes'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (verificationId: string) => {
    try {
      const { error } = await supabase.rpc('approve_driver_verification', {
        verification_id: verificationId
      });

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Demande approuvée avec succès'
      });

      setDetailsOpen(false);
      loadVerifications();
    } catch (error: any) {
      console.error('Erreur approbation:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error.message || "Impossible d'approuver la demande"
      });
    }
  };

  const handleReject = async (verificationId: string, reason: string) => {
    try {
      const { error } = await supabase.rpc('reject_driver_verification', {
        verification_id: verificationId,
        rejection_reason: reason
      });

      if (error) throw error;

      toast({
        title: 'Succès',
        description: 'Demande rejetée'
      });

      setDetailsOpen(false);
      loadVerifications();
    } catch (error: any) {
      console.error('Erreur rejet:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error.message || 'Impossible de rejeter la demande'
      });
    }
  };

  const renderVerificationCard = (verification: Verification) => (
    <Card key={verification.id} className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <Car className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-semibold">
                {verification.vehicle_make} {verification.vehicle_model}
              </p>
              <p className="text-sm text-muted-foreground">
                {verification.vehicle_year} • {verification.vehicle_color} • {verification.vehicle_plate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{new Date(verification.created_at).toLocaleDateString('fr-FR')}</span>
            </div>
            <span>{verification.experience_years} ans d'expérience</span>
            {verification.hourly_rate && (
              <span className="font-semibold text-primary">{verification.hourly_rate} €/h</span>
            )}
          </div>

          {verification.rejection_reason && (
            <div className="mt-2 p-2 bg-destructive/10 rounded-md">
              <p className="text-sm text-destructive">
                <strong>Raison du rejet:</strong> {verification.rejection_reason}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-3">
          <Badge variant={
            verification.status === 'pending' ? 'default' :
            verification.status === 'approved' ? 'default' : 'destructive'
          }>
            {verification.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
            {verification.status === 'approved' && <CheckCircle className="h-3 w-3 mr-1" />}
            {verification.status === 'rejected' && <XCircle className="h-3 w-3 mr-1" />}
            {verification.status === 'pending' ? 'En attente' :
             verification.status === 'approved' ? 'Approuvé' : 'Rejeté'}
          </Badge>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedVerification(verification);
                setDetailsOpen(true);
              }}
            >
              <Eye className="h-4 w-4 mr-1" />
              Détails
            </Button>

            {verification.status === 'pending' && (
              <>
                <Button
                  size="sm"
                  onClick={() => handleApprove(verification.id)}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approuver
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    const reason = prompt('Raison du rejet:');
                    if (reason) {
                      handleReject(verification.id, reason);
                    }
                  }}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Rejeter
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-24 bg-muted rounded"></div>
          </Card>
        ))}
      </div>
    );
  }

  const pendingVerifications = verifications.filter(v => v.status === 'pending');
  const approvedVerifications = verifications.filter(v => v.status === 'approved');
  const rejectedVerifications = verifications.filter(v => v.status === 'rejected');

  return (
    <>
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">
            En attente ({pendingVerifications.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approuvées ({approvedVerifications.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejetées ({rejectedVerifications.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingVerifications.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Aucune demande en attente</p>
            </Card>
          ) : (
            pendingVerifications.map(renderVerificationCard)
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {approvedVerifications.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Aucune demande approuvée</p>
            </Card>
          ) : (
            approvedVerifications.map(renderVerificationCard)
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {rejectedVerifications.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Aucune demande rejetée</p>
            </Card>
          ) : (
            rejectedVerifications.map(renderVerificationCard)
          )}
        </TabsContent>
      </Tabs>

      <DriverDetails
        verification={selectedVerification}
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </>
  );
};

export default KYCManagement;
