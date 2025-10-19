import React, { useState, useEffect } from 'react';
import { Car, Upload, CheckCircle, Clock, XCircle, FileText } from 'lucide-react';
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

interface DriverVerification {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: number;
  vehicle_color: string;
  vehicle_plate: string;
  experience_years: number;
  bio: string | null;
  hourly_rate: number | null;
  created_at: string;
  rejection_reason: string | null;
}

const BecomeDriverForm = () => {
  const { user, hasRole } = useAuth();
  const [existingVerification, setExistingVerification] = useState<DriverVerification | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    vehicle_make: '',
    vehicle_model: '',
    vehicle_year: new Date().getFullYear(),
    vehicle_color: '',
    vehicle_plate: '',
    experience_years: 0,
    bio: '',
    hourly_rate: ''
  });

  useEffect(() => {
    if (user) {
      checkExistingVerification();
    }
  }, [user]);

  const checkExistingVerification = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('driver_verifications')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setExistingVerification(data as DriverVerification);
        setFormData({
          vehicle_make: data.vehicle_make,
          vehicle_model: data.vehicle_model,
          vehicle_year: data.vehicle_year,
          vehicle_color: data.vehicle_color,
          vehicle_plate: data.vehicle_plate,
          experience_years: data.experience_years,
          bio: data.bio || '',
          hourly_rate: data.hourly_rate?.toString() || ''
        });
      }
    } catch (error) {
      console.error('Erreur vérification:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Vous devez être connecté');
      return;
    }

    // Validation
    if (!formData.vehicle_make || !formData.vehicle_model || !formData.vehicle_color || !formData.vehicle_plate) {
      toast.error('Veuillez remplir tous les champs requis');
      return;
    }

    setSubmitting(true);

    try {
      const submitData = {
        user_id: user.id,
        vehicle_make: formData.vehicle_make,
        vehicle_model: formData.vehicle_model,
        vehicle_year: formData.vehicle_year,
        vehicle_color: formData.vehicle_color,
        vehicle_plate: formData.vehicle_plate.toUpperCase(),
        experience_years: formData.experience_years,
        bio: formData.bio || null,
        hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
        status: 'pending'
      };

      let error;

      if (existingVerification && existingVerification.status === 'pending') {
        // Update existing pending verification
        const { error: updateError } = await supabase
          .from('driver_verifications')
          .update(submitData)
          .eq('id', existingVerification.id);
        error = updateError;
      } else {
        // Create new verification
        const { error: insertError } = await supabase
          .from('driver_verifications')
          .insert(submitData);
        error = insertError;
      }

      if (error) throw error;

      toast.success('Demande soumise !', {
        description: 'Nous examinerons votre demande sous 24-48h'
      });

      // Reload verification status
      checkExistingVerification();
    } catch (error: any) {
      console.error('Erreur soumission:', error);
      toast.error('Impossible de soumettre la demande');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Chargement...</p>
        </CardContent>
      </Card>
    );
  }

  // Si déjà chauffeur
  if (hasRole('chauffeur')) {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <h3 className="font-semibold text-green-800">Vous êtes chauffeur vérifié</h3>
              <p className="text-sm text-green-700">Vous pouvez accepter des demandes</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Si demande en cours
  if (existingVerification && existingVerification.status === 'pending') {
    return (
      <Card className="bg-orange-50 border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-600" />
            Demande en cours de vérification
          </CardTitle>
          <CardDescription>
            Votre demande a été soumise le {new Date(existingVerification.created_at).toLocaleDateString('fr-FR')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Nous examinerons votre demande sous 24-48h. Vous recevrez une notification une fois la vérification terminée.
            </AlertDescription>
          </Alert>
          
          <div className="mt-4 space-y-2 text-sm">
            <p><strong>Véhicule:</strong> {existingVerification.vehicle_make} {existingVerification.vehicle_model} ({existingVerification.vehicle_year})</p>
            <p><strong>Plaque:</strong> {existingVerification.vehicle_plate}</p>
            <p><strong>Expérience:</strong> {existingVerification.experience_years} ans</p>
          </div>

          <Button
            variant="outline"
            onClick={() => setExistingVerification(null)}
            className="mt-4"
          >
            Modifier ma demande
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Si demande rejetée
  if (existingVerification && existingVerification.status === 'rejected') {
    return (
      <Card className="bg-red-50 border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-600" />
            Demande refusée
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              {existingVerification.rejection_reason || 'Votre demande n\'a pas été approuvée. Veuillez vérifier vos informations et soumettre une nouvelle demande.'}
            </AlertDescription>
          </Alert>

          <Button
            onClick={() => setExistingVerification(null)}
            className="mt-4"
          >
            Soumettre une nouvelle demande
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Formulaire de candidature
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Car className="h-6 w-6 text-electric-600" />
          Devenir chauffeur
        </CardTitle>
        <CardDescription>
          Remplissez ce formulaire pour commencer à gagner de l'argent en tant que chauffeur
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations du véhicule */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Car className="h-4 w-4" />
              Informations du véhicule
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vehicle_make">Marque *</Label>
                <Input
                  id="vehicle_make"
                  value={formData.vehicle_make}
                  onChange={(e) => handleChange('vehicle_make', e.target.value)}
                  placeholder="Peugeot, Renault, Tesla..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehicle_model">Modèle *</Label>
                <Input
                  id="vehicle_model"
                  value={formData.vehicle_model}
                  onChange={(e) => handleChange('vehicle_model', e.target.value)}
                  placeholder="208, Zoe, Model 3..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehicle_year">Année *</Label>
                <Input
                  id="vehicle_year"
                  type="number"
                  min="2000"
                  max={new Date().getFullYear() + 1}
                  value={formData.vehicle_year}
                  onChange={(e) => handleChange('vehicle_year', parseInt(e.target.value))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehicle_color">Couleur *</Label>
                <Input
                  id="vehicle_color"
                  value={formData.vehicle_color}
                  onChange={(e) => handleChange('vehicle_color', e.target.value)}
                  placeholder="Blanc, Noir, Bleu..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehicle_plate">Plaque d'immatriculation *</Label>
                <Input
                  id="vehicle_plate"
                  value={formData.vehicle_plate}
                  onChange={(e) => handleChange('vehicle_plate', e.target.value.toUpperCase())}
                  placeholder="AB-123-CD"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience_years">Années d'expérience</Label>
                <Input
                  id="experience_years"
                  type="number"
                  min="0"
                  max="50"
                  value={formData.experience_years}
                  onChange={(e) => handleChange('experience_years', parseInt(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* Informations professionnelles */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Informations professionnelles
            </h3>

            <div className="space-y-2">
              <Label htmlFor="bio">Présentation (optionnel)</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                placeholder="Parlez-nous de votre expérience..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hourly_rate">Tarif horaire souhaité (optionnel)</Label>
              <div className="relative">
                <Input
                  id="hourly_rate"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.hourly_rate}
                  onChange={(e) => handleChange('hourly_rate', e.target.value)}
                  placeholder="25.00"
                />
                <span className="absolute right-3 top-2.5 text-muted-foreground">€/h</span>
              </div>
            </div>
          </div>

          {/* Info */}
          <Alert>
            <AlertDescription className="text-sm">
              💡 Après soumission, votre demande sera examinée sous 24-48h. Vous recevrez une notification de notre décision.
            </AlertDescription>
          </Alert>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full"
            disabled={submitting}
          >
            {submitting ? 'Envoi en cours...' : 'Soumettre ma candidature'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default BecomeDriverForm;
