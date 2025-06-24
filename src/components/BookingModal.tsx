
import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, Car, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface Service {
  id: number;
  name: string;
  price: string;
  rating: number;
  description: string;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: Service[];
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, services }) => {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    address: '',
    phone: '',
    notes: ''
  });
  const { toast } = useToast();

  if (!isOpen) return null;

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setStep(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Réservation confirmée !",
      description: `Votre service ${selectedService?.name} a été réservé avec succès.`,
    });
    onClose();
    setStep(1);
    setSelectedService(null);
    setFormData({ date: '', time: '', address: '', phone: '', notes: '' });
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-foreground">Choisissez votre service</h3>
        <p className="text-muted-foreground">Sélectionnez le service valet qui vous convient</p>
      </div>
      
      {services.map((service) => (
        <Card 
          key={service.id} 
          className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.02] hover:border-electric-300"
          onClick={() => handleServiceSelect(service)}
        >
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium text-foreground">{service.name}</h4>
                <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-electric-600">{service.price}</div>
                <div className="text-xs text-muted-foreground">⭐ {service.rating}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderStep2 = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-foreground">Détails de la réservation</h3>
        <p className="text-muted-foreground">Service sélectionné: {selectedService?.name}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Date
          </Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="time" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Heure
          </Label>
          <Select onValueChange={(value) => setFormData({ ...formData, time: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Choisir l'heure" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="08:00">08:00</SelectItem>
              <SelectItem value="09:00">09:00</SelectItem>
              <SelectItem value="10:00">10:00</SelectItem>
              <SelectItem value="11:00">11:00</SelectItem>
              <SelectItem value="14:00">14:00</SelectItem>
              <SelectItem value="15:00">15:00</SelectItem>
              <SelectItem value="16:00">16:00</SelectItem>
              <SelectItem value="17:00">17:00</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address" className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Adresse de récupération
        </Label>
        <Input
          id="address"
          placeholder="123 Rue de la Paix, 75001 Paris"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone" className="flex items-center gap-2">
          <Car className="h-4 w-4" />
          Téléphone
        </Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+33 6 12 34 56 78"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Instructions spéciales (optionnel)</Label>
        <Textarea
          id="notes"
          placeholder="Informations supplémentaires pour le valet..."
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
        />
      </div>

      <Card className="bg-electric-50 border-electric-200">
        <CardContent className="p-4">
          <h4 className="font-medium text-electric-800 mb-2">Récapitulatif</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-electric-700">Service:</span>
              <span className="text-electric-800 font-medium">{selectedService?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-electric-700">Prix:</span>
              <span className="text-electric-800 font-medium">{selectedService?.price}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-electric-700">Frais de service:</span>
              <span className="text-electric-800 font-medium">2€</span>
            </div>
            <div className="border-t border-electric-200 pt-2 mt-2">
              <div className="flex justify-between font-semibold">
                <span className="text-electric-800">Total:</span>
                <span className="text-electric-800">{parseInt(selectedService?.price || '0') + 2}€</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => setStep(1)}
          className="flex-1"
        >
          Retour
        </Button>
        <Button 
          type="submit" 
          className="flex-1 bg-gradient-to-r from-electric-500 to-electric-600 hover:from-electric-600 hover:to-electric-700"
        >
          <CreditCard className="h-4 w-4 mr-2" />
          Confirmer et payer
        </Button>
      </div>
    </form>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Réserver un service</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {step === 1 ? renderStep1() : renderStep2()}
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingModal;
