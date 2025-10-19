import React, { useState, useEffect } from 'react';
import { Car, Upload, Check, AlertCircle, Clock, FileText, X, Download } from 'lucide-react';
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

interface DocumentUpload {
  file: File | null;
  preview: string | null;
  uploading: boolean;
}

const BecomeDriverForm = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [verification, setVerification] = useState<VerificationStatus | null>(null);
  const [documents, setDocuments] = useState<{
    driver_license: DocumentUpload;
    identity_document: DocumentUpload;
    insurance: DocumentUpload;
    vehicle_registration: DocumentUpload;
  }>({
    driver_license: { file: null, preview: null, uploading: false },
    identity_document: { file: null, preview: null, uploading: false },
    insurance: { file: null, preview: null, uploading: false },
    vehicle_registration: { file: null, preview: null, uploading: false },
  });
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

  const handleFileChange = (docType: keyof typeof documents, file: File | null) => {
    if (!file) {
      setDocuments(prev => ({
        ...prev,
        [docType]: { file: null, preview: null, uploading: false }
      }));
      return;
    }

    // Validation
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      toast.error('Format invalide', {
        description: 'Seuls les fichiers PDF, JPG et PNG sont acceptés.'
      });
      return;
    }

    if (file.size > maxSize) {
      toast.error('Fichier trop volumineux', {
        description: 'La taille maximale est de 5 MB.'
      });
      return;
    }

    // Créer un aperçu
    const reader = new FileReader();
    reader.onloadend = () => {
      setDocuments(prev => ({
        ...prev,
        [docType]: { 
          file, 
          preview: reader.result as string, 
          uploading: false 
        }
      }));
    };
    reader.readAsDataURL(file);
  };

  const uploadDocument = async (docType: keyof typeof documents): Promise<string | null> => {
    const doc = documents[docType];
    if (!doc.file || !user) return null;

    setDocuments(prev => ({
      ...prev,
      [docType]: { ...prev[docType], uploading: true }
    }));

    try {
      const fileExt = doc.file.name.split('.').pop();
      const fileName = `${user.id}/${docType}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('driver-documents')
        .upload(fileName, doc.file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('driver-documents')
        .getPublicUrl(fileName);

      setDocuments(prev => ({
        ...prev,
        [docType]: { ...prev[docType], uploading: false }
      }));

      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      setDocuments(prev => ({
        ...prev,
        [docType]: { ...prev[docType], uploading: false }
      }));
      toast.error('Erreur lors de l\'upload', {
        description: 'Impossible de télécharger le document.'
      });
      return null;
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

    // Vérifier que tous les documents sont présents
    if (!documents.driver_license.file || !documents.identity_document.file || 
        !documents.insurance.file || !documents.vehicle_registration.file) {
      toast.error('Documents manquants', {
        description: 'Tous les documents sont obligatoires pour soumettre votre demande.'
      });
      return;
    }

    setLoading(true);

    try {
      // Upload documents first
      toast.info('Upload des documents en cours...');
      const driver_license_url = await uploadDocument('driver_license');
      const identity_document_url = await uploadDocument('identity_document');
      const insurance_url = await uploadDocument('insurance');
      const vehicle_registration_url = await uploadDocument('vehicle_registration');

      if (!driver_license_url || !identity_document_url || !insurance_url || !vehicle_registration_url) {
        throw new Error('Erreur lors de l\'upload des documents');
      }

      const { error } = await supabase
        .from('driver_verifications')
        .insert({
          user_id: user.id,
          ...formData,
          status: 'pending',
          driver_license_url,
          identity_document_url,
          insurance_url,
          vehicle_registration_url
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

          {/* Documents KYC */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-electric-600" />
              Documents obligatoires (KYC)
            </h3>
            <p className="text-sm text-muted-foreground">
              Conformément à la réglementation française, vous devez fournir les documents suivants (PDF, JPG ou PNG, max 5MB)
            </p>

            <div className="grid gap-4">
              {/* Permis de conduire */}
              <div className="space-y-2">
                <Label htmlFor="driver_license" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Permis de conduire <span className="text-destructive">*</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="driver_license"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange('driver_license', e.target.files?.[0] || null)}
                    disabled={loading}
                  />
                  {documents.driver_license.file && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleFileChange('driver_license', null)}
                      disabled={loading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {documents.driver_license.file && (
                  <p className="text-xs text-muted-foreground">
                    ✓ {documents.driver_license.file.name}
                  </p>
                )}
              </div>

              {/* Pièce d'identité */}
              <div className="space-y-2">
                <Label htmlFor="identity_document" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Carte d'identité ou Passeport <span className="text-destructive">*</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="identity_document"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange('identity_document', e.target.files?.[0] || null)}
                    disabled={loading}
                  />
                  {documents.identity_document.file && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleFileChange('identity_document', null)}
                      disabled={loading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {documents.identity_document.file && (
                  <p className="text-xs text-muted-foreground">
                    ✓ {documents.identity_document.file.name}
                  </p>
                )}
              </div>

              {/* Assurance */}
              <div className="space-y-2">
                <Label htmlFor="insurance" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Attestation d'assurance <span className="text-destructive">*</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="insurance"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange('insurance', e.target.files?.[0] || null)}
                    disabled={loading}
                  />
                  {documents.insurance.file && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleFileChange('insurance', null)}
                      disabled={loading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {documents.insurance.file && (
                  <p className="text-xs text-muted-foreground">
                    ✓ {documents.insurance.file.name}
                  </p>
                )}
              </div>

              {/* Carte grise */}
              <div className="space-y-2">
                <Label htmlFor="vehicle_registration" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Carte grise <span className="text-destructive">*</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="vehicle_registration"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange('vehicle_registration', e.target.files?.[0] || null)}
                    disabled={loading}
                  />
                  {documents.vehicle_registration.file && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleFileChange('vehicle_registration', null)}
                      disabled={loading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {documents.vehicle_registration.file && (
                  <p className="text-xs text-muted-foreground">
                    ✓ {documents.vehicle_registration.file.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Informations importantes */}
          <Alert>
            <Check className="h-4 w-4" />
            <AlertDescription>
              <strong>Prochaines étapes :</strong>
              <ul className="list-disc list-inside mt-2 text-sm space-y-1">
                <li>Soumission de votre demande avec documents</li>
                <li>Vérification KYC par notre équipe (24-48h)</li>
                <li>Notification de validation</li>
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
