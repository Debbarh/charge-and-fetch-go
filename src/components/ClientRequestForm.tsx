
import React, { useState } from 'react';
import { MapPin, Clock, Car, Euro, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const ClientRequestForm = () => {
  const [requestForm, setRequestForm] = useState({
    pickupAddress: '',
    destinationAddress: '',
    vehicleModel: '',
    urgency: '',
    estimatedDuration: '',
    proposedPrice: '',
    batteryLevel: '',
    notes: '',
    contactPhone: ''
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Demande publiée !",
      description: "Votre demande a été envoyée aux chauffeurs disponibles. Vous recevrez des offres bientôt.",
    });
    // Reset form
    setRequestForm({
      pickupAddress: '',
      destinationAddress: '',
      vehicleModel: '',
      urgency: '',
      estimatedDuration: '',
      proposedPrice: '',
      batteryLevel: '',
      notes: '',
      contactPhone: ''
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Demander un Chauffeur-Valet</h2>
        <p className="text-muted-foreground">Créez votre demande personnalisée pour trouver un chauffeur</p>
      </div>

      <Card className="bg-gradient-to-r from-electric-50 to-blue-50 border-electric-200">
        <CardContent className="p-6">
          <h3 className="font-semibold text-electric-800 mb-4">Comment ça marche ?</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="w-12 h-12 bg-electric-500 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-2">1</div>
              <p className="text-sm text-electric-700">Créez votre demande</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-electric-500 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-2">2</div>
              <p className="text-sm text-electric-700">Recevez des offres</p>
            </div>
            <div>
              <div className="w-12 h-12 bg-electric-500 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-2">3</div>
              <p className="text-sm text-electric-700">Choisissez votre chauffeur</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Détails de votre demande</CardTitle>
          <CardDescription>Remplissez les informations pour que les chauffeurs puissent vous proposer leurs services</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pickup" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Adresse de récupération
                </Label>
                <Input
                  id="pickup"
                  placeholder="123 Rue de la Paix, Paris"
                  value={requestForm.pickupAddress}
                  onChange={(e) => setRequestForm({ ...requestForm, pickupAddress: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="destination" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Station de recharge (optionnel)
                </Label>
                <Input
                  id="destination"
                  placeholder="Tesla Supercharger..."
                  value={requestForm.destinationAddress}
                  onChange={(e) => setRequestForm({ ...requestForm, destinationAddress: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vehicle" className="flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  Modèle du véhicule
                </Label>
                <Input
                  id="vehicle"
                  placeholder="Tesla Model 3, Renault Zoe..."
                  value={requestForm.vehicleModel}
                  onChange={(e) => setRequestForm({ ...requestForm, vehicleModel: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="battery">Niveau de batterie actuel (%)</Label>
                <Input
                  id="battery"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="15"
                  value={requestForm.batteryLevel}
                  onChange={(e) => setRequestForm({ ...requestForm, batteryLevel: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="urgency">Urgence</Label>
                <Select onValueChange={(value) => setRequestForm({ ...requestForm, urgency: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Niveau d'urgence" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Flexible (dans la journée)</SelectItem>
                    <SelectItem value="medium">Modéré (dans 2-3h)</SelectItem>
                    <SelectItem value="high">Urgent (dans l'heure)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Durée estimée
                </Label>
                <Input
                  id="duration"
                  placeholder="2h, 3h..."
                  value={requestForm.estimatedDuration}
                  onChange={(e) => setRequestForm({ ...requestForm, estimatedDuration: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price" className="flex items-center gap-2">
                  <Euro className="h-4 w-4" />
                  Prix proposé (€)
                </Label>
                <Input
                  id="price"
                  type="number"
                  min="10"
                  placeholder="25"
                  value={requestForm.proposedPrice}
                  onChange={(e) => setRequestForm({ ...requestForm, proposedPrice: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone de contact</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+33 6 12 34 56 78"
                  value={requestForm.contactPhone}
                  onChange={(e) => setRequestForm({ ...requestForm, contactPhone: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Instructions spéciales (optionnel)</Label>
              <Textarea
                id="notes"
                placeholder="Informations supplémentaires (accès parking, étage, etc.)..."
                value={requestForm.notes}
                onChange={(e) => setRequestForm({ ...requestForm, notes: e.target.value })}
                rows={3}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-electric-500 to-electric-600 hover:from-electric-600 hover:to-electric-700"
            >
              <Send className="h-4 w-4 mr-2" />
              Publier ma demande
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="font-medium text-blue-800 mb-2">💡 Conseils pour une meilleure demande</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Soyez précis sur l'adresse de récupération</li>
            <li>• Indiquez si un parking/garage nécessite un code d'accès</li>
            <li>• Proposez un prix équitable selon l'urgence et la distance</li>
            <li>• Plus votre demande est détaillée, plus vous aurez de réponses</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientRequestForm;
