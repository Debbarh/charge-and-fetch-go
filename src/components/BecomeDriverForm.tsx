import React, { useState, useEffect } from 'react';
import { Car, Upload, Check, AlertCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface VerificationStatus {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason: string | null;
  created_at: string;
}

const BecomeDriverForm = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [verification, setVerification] = useState<VerificationStatus | null>(null);
  const [formData, setFormData] = useState({
    vehicle_make: '',
    vehicle_model: '',
    vehicle_year: new Date().getFullYear(),
    vehicle_color: '',
    vehicle_plate: '',
    experience_years: 0,
    bio: '',
    hourly_rate: 25
  });

  useEffect(() => {
    loadVerificationStatus();
  }, [user]);

  const loadVerificationStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('driver_verifications')
        .select('id, status, rejection_reason, created_at')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setVerification({
          id: data.id,
          status: data.status as 'pending' | 'approved' | 'rejected',
          rejection_reason: data.rejection_reason,
          created_at: data.created_at
        });
      }
    } catch (error) {
      console.error('Erreur chargement vérification:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validation
    if (!formData.vehicle_make || !formData.vehicle_model || !formData.vehicle_plate) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('driver_verifications')
        .insert({
          user_id: user.id,
          ...formData,
          status: 'pending'
        });

      if (error) throw error;

      toast.success('Demande envoyée avec succès !', {
        description: 'Nous examinerons votre dossier dans les 24-48h'
      });

      loadVerificationStatus();
    } catch (error: any) {
      console.error('Erreur soumission:', error);
      toast.error('Impossible d\'envoyer la demande', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Afficher le statut si une demande existe
  if (verification) {
    if (verification.status === 'pending') {
      return (
        <Card className="bg-gradient-to-br from-blue-50 to-electric-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="h-12 w-12 text-blue-600" />
              <div className="flex-1">
                <h3 className="font-bold text-lg text-blue-900">Demande en cours de traitement</h3>
                <p className="text-sm text-blue-700">
                  Soumise le {new Date(verification.created_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                En attente
              </Badge>
            </div>
            <p className="text-sm text-blue-800">
              Nous examinons votre dossier. Vous recevrez une notification dès que la vérification sera terminée (24-48h).
            </p>
          </CardContent>
        </Card>
      );
    }

    if (verification.status === 'rejected') {
      return (
        <Card className="border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="h-12 w-12 text-red-600" />
              <div className="flex-1">
                <h3 className="font-bold text-lg text-red-900">Demande refusée</h3>
                <p className="text-sm text-red-700">
                  Refusée le {new Date(verification.created_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
            {verification.rejection_reason && (
              <Alert>
                <AlertDescription className="text-sm">
                  <strong>Raison :</strong> {verification.rejection_reason}
                </AlertDescription>
              </Alert>
            )}
            <Button
              className="mt-4 w-full"
              onClick={() => setVerification(null)}
            >
              Soumettre une nouvelle demande
            </Button>
          </CardContent>
        </Card>
      );
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-electric-100 flex items-center justify-center">
            <Car className="h-6 w-6 text-electric-600" />
          </div>
          <div>
            <CardTitle>Devenir chauffeur valet</CardTitle>
            <CardDescription>
              Rejoignez notre communauté de chauffeurs professionnels
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations du véhicule */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Car className="h-5 w-5 text-electric-600" />
              Informations du véhicule
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vehicle_make">Marque *</Label>
                <Input
                  id="vehicle_make"
                  value={formData.vehicle_make}
                  onChange={(e) => handleChange('vehicle_make', e.target.value)}
                  placeholder="ex: Peugeot"
                  required
                />
              </div>

              <div>
                <Label htmlFor="vehicle_model">Modèle *</Label>
                <Input
                  id="vehicle_model"
                  value={formData.vehicle_model}
                  onChange={(e) => handleChange('vehicle_model', e.target.value)}
                  placeholder="ex: 208"
                  required
                />
              </div>

              <div>
                <Label htmlFor="vehicle_year">Année</Label>
                <Input
                  id="vehicle_year"
                  type="number"
                  value={formData.vehicle_year}
                  onChange={(e) => handleChange('vehicle_year', parseInt(e.target.value))}
                  min="2000"
                  max={new Date().getFullYear() + 1}
                />
              </div>

              <div>
                <Label htmlFor="vehicle_color">Couleur</Label>
                <Input
                  id="vehicle_color"
                  value={formData.vehicle_color}
                  onChange={(e) => handleChange('vehicle_color', e.target.value)}
                  placeholder="ex: Blanche"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="vehicle_plate">Immatriculation *</Label>
                <Input
                  id="vehicle_plate"
                  value={formData.vehicle_plate}
                  onChange={(e) => handleChange('vehicle_plate', e.target.value.toUpperCase())}
                  placeholder="ex: AB-123-CD"
                  required
                />
              </div>
            </div>
          </div>

          {/* Informations professionnelles */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Expérience professionnelle</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="experience_years">Années d'expérience</Label>
                <Input
                  id="experience_years"
                  type="number"
                  value={formData.experience_years}
                  onChange={(e) => handleChange('experience_years', parseInt(e.target.value))}
                  min="0"
                  max="50"
                />
              </div>

              <div>
                <Label htmlFor="hourly_rate">Tarif horaire (€)</Label>
                <Input
                  id="hourly_rate"
                  type="number"
                  value={formData.hourly_rate}
                  onChange={(e) => handleChange('hourly_rate', parseFloat(e.target.value))}
                  min="10"
                  max="100"
                  step="5"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="bio">Présentation (optionnel)</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                placeholder="Parlez de votre expérience, de vos compétences..."
                rows={4}
              />
            </div>
          </div>

          {/* Informations importantes */}
          <Alert>
            <Check className="h-4 w-4" />
            <AlertDescription>
              <strong>Prochaines étapes :</strong>
              <ul className="list-disc list-inside mt-2 text-sm space-y-1">
                <li>Soumission de votre demande</li>
                <li>Vérification par notre équipe (24-48h)</li>
                <li>Notification de validation ou demande de documents supplémentaires</li>
                <li>Activation de votre compte chauffeur</li>
              </ul>
            </AlertDescription>
          </Alert>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={loading}
          >
            {loading ? 'Envoi en cours...' : 'Envoyer ma demande'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default BecomeDriverForm;
