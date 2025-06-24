import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import NearbyChargersDrivers from './NearbyChargersDrivers';
import DriverProfile from './driver/DriverProfile';
import DriverTabs from './driver/DriverTabs';
import AvailableRequests from './driver/AvailableRequests';
import ClientRequests from './driver/ClientRequests';
import MyOffers from './driver/MyOffers';
import DriverStats from './driver/DriverStats';
import CounterOfferDialog from './driver/CounterOfferDialog';

interface DriverRequest {
  id: number;
  customerName: string;
  pickupAddress: string;
  returnAddress: string;
  vehicleModel: string;
  estimatedTime: string;
  payment: string;
  distance: string;
  batteryLevel: number;
  urgency: 'low' | 'medium' | 'high';
}

interface ClientRequest {
  id: number;
  customerName: string;
  pickupAddress: string;
  destinationAddress: string;
  vehicleModel: string;
  urgency: 'low' | 'medium' | 'high';
  estimatedDuration: string;
  proposedPrice: string;
  batteryLevel: string;
  notes: string;
  contactPhone: string;
  status: 'pending' | 'accepted' | 'rejected' | 'counter_offered';
}

const DriverService = () => {
  const [activeTab, setActiveTab] = useState<'available' | 'client_requests' | 'my_offers' | 'network'>('network');
  const [counterOffer, setCounterOffer] = useState({
    requestId: 0,
    newPrice: '',
    newDuration: '',
    message: ''
  });
  const [showCounterOfferDialog, setShowCounterOfferDialog] = useState(false);
  const [myOffers, setMyOffers] = useState<any[]>([]);
  const { toast } = useToast();

  // Simulated client requests from the ClientRequestForm
  const clientRequests: ClientRequest[] = [
    {
      id: 101,
      customerName: "Sophie M.",
      pickupAddress: "78 Boulevard Saint-Germain, Paris",
      destinationAddress: "Tesla Supercharger République",
      vehicleModel: "Peugeot e-208",
      urgency: 'high',
      estimatedDuration: "4h",
      proposedPrice: "35",
      batteryLevel: "8",
      notes: "Parking souterrain, code 1234. Véhicule en zone bleue.",
      contactPhone: "+33 6 12 34 56 78",
      status: 'pending'
    },
    {
      id: 102,
      customerName: "Marc T.",
      pickupAddress: "15 Rue de la Paix, Paris",
      destinationAddress: "",
      vehicleModel: "BMW i3",
      urgency: 'medium',
      estimatedDuration: "2h",
      proposedPrice: "20",
      batteryLevel: "12",
      notes: "Disponible toute la journée",
      contactPhone: "+33 6 98 76 54 32",
      status: 'pending'
    }
  ];

  // Load driver offers from localStorage
  useEffect(() => {
    const savedOffers = localStorage.getItem('driverOffers');
    if (savedOffers) {
      setMyOffers(JSON.parse(savedOffers));
    }
  }, []);

  const availableRequests: DriverRequest[] = [
    {
      id: 1,
      customerName: "Marie L.",
      pickupAddress: "123 Rue de Rivoli, Paris",
      returnAddress: "123 Rue de Rivoli, Paris",
      vehicleModel: "Tesla Model 3",
      estimatedTime: "2h",
      payment: "25€",
      distance: "1.2 km",
      batteryLevel: 15,
      urgency: 'high'
    },
    {
      id: 2,
      customerName: "Jean D.",
      pickupAddress: "45 Avenue des Champs, Paris",
      returnAddress: "45 Avenue des Champs, Paris",
      vehicleModel: "Renault Zoe",
      estimatedTime: "3h",
      payment: "18€",
      distance: "0.8 km",
      batteryLevel: 25,
      urgency: 'medium'
    }
  ];

  const handleAcceptRequest = (requestId: number) => {
    // Simulate creating an offer
    const newOffer = {
      id: Date.now(),
      requestId: requestId,
      status: 'sent',
      proposedPrice: Math.floor(Math.random() * 20) + 20,
      estimatedDuration: `${Math.floor(Math.random() * 3) + 2}h`,
      message: 'Je peux prendre en charge votre demande rapidement !',
      sentAt: new Date().toISOString()
    };

    const updatedOffers = [...myOffers, newOffer];
    setMyOffers(updatedOffers);
    localStorage.setItem('driverOffers', JSON.stringify(updatedOffers));

    toast({
      title: "Offre envoyée !",
      description: "Votre proposition a été envoyée au client.",
    });
  };

  const handleAcceptClientRequest = (requestId: number) => {
    const request = clientRequests.find(r => r.id === requestId);
    if (!request) return;

    // Create driver offer and add to localStorage for ClientOffers component
    const driverOffer = {
      id: Date.now(),
      driverId: 1,
      driverName: 'Chauffeur Pro',
      driverRating: 4.9,
      driverTotalRides: 127,
      driverVehicle: 'Peugeot 208',
      driverExperience: "5 ans d'expérience",
      originalRequestId: requestId,
      proposedPrice: request.proposedPrice,
      estimatedDuration: request.estimatedDuration,
      message: "J'accepte votre demande aux conditions proposées !",
      driverPhone: '+33 6 12 34 56 78',
      status: 'pending',
      receivedAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      negotiationHistory: [],
      responseTime: '< 5 min',
      availability: 'Immédiate'
    };

    // Add to received offers in localStorage
    const existingOffers = JSON.parse(localStorage.getItem('receivedOffers') || '[]');
    const updatedOffers = [...existingOffers, driverOffer];
    localStorage.setItem('receivedOffers', JSON.stringify(updatedOffers));

    // Add to my offers tracking
    const myOffer = {
      id: driverOffer.id,
      requestId: requestId,
      status: 'sent',
      proposedPrice: request.proposedPrice,
      estimatedDuration: request.estimatedDuration,
      message: driverOffer.message,
      sentAt: new Date().toISOString()
    };

    const updatedMyOffers = [...myOffers, myOffer];
    setMyOffers(updatedMyOffers);
    localStorage.setItem('driverOffers', JSON.stringify(updatedMyOffers));

    toast({
      title: "Demande client acceptée !",
      description: "Le client a été notifié de votre acceptation.",
    });
  };

  const handleRejectClientRequest = (requestId: number) => {
    toast({
      title: "Demande rejetée",
      description: "La demande a été retirée de votre liste.",
    });
  };

  const handleCounterOffer = (requestId: number) => {
    setCounterOffer({ ...counterOffer, requestId });
    setShowCounterOfferDialog(true);
  };

  const submitCounterOffer = () => {
    const request = clientRequests.find(r => r.id === counterOffer.requestId);
    if (!request) return;

    // Create counter-offer and add to localStorage
    const driverOffer = {
      id: Date.now(),
      driverId: 1,
      driverName: 'Chauffeur Pro',
      driverRating: 4.9,
      driverTotalRides: 127,
      driverVehicle: 'Peugeot 208',
      driverExperience: "5 ans d'expérience",
      originalRequestId: counterOffer.requestId,
      proposedPrice: counterOffer.newPrice,
      estimatedDuration: counterOffer.newDuration || request.estimatedDuration,
      message: counterOffer.message,
      driverPhone: '+33 6 12 34 56 78',
      status: 'pending',
      receivedAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      negotiationHistory: [{
        id: Date.now(),
        timestamp: new Date().toISOString(),
        from: 'driver',
        price: counterOffer.newPrice,
        duration: counterOffer.newDuration,
        message: counterOffer.message,
        status: 'pending'
      }],
      responseTime: '< 5 min',
      availability: 'Immédiate'
    };

    const existingOffers = JSON.parse(localStorage.getItem('receivedOffers') || '[]');
    const updatedOffers = [...existingOffers, driverOffer];
    localStorage.setItem('receivedOffers', JSON.stringify(updatedOffers));

    toast({
      title: "Contre-proposition envoyée !",
      description: "Le client recevra votre nouvelle proposition.",
    });
    setShowCounterOfferDialog(false);
    setCounterOffer({ requestId: 0, newPrice: '', newDuration: '', message: '' });
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'Urgent';
      case 'medium': return 'Modéré';
      case 'low': return 'Flexible';
      default: return 'Normal';
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'available':
        return (
          <AvailableRequests
            requests={availableRequests}
            onAcceptRequest={handleAcceptRequest}
            getUrgencyColor={getUrgencyColor}
            getUrgencyLabel={getUrgencyLabel}
          />
        );
      case 'client_requests':
        return (
          <ClientRequests
            requests={clientRequests}
            onAcceptRequest={handleAcceptClientRequest}
            onRejectRequest={handleRejectClientRequest}
            onCounterOffer={handleCounterOffer}
            getUrgencyColor={getUrgencyColor}
            getUrgencyLabel={getUrgencyLabel}
          />
        );
      case 'my_offers':
        return <MyOffers offers={myOffers} />;
      case 'network':
        return <NearbyChargersDrivers />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Interface Chauffeur</h2>
        <p className="text-muted-foreground">Gérez vos demandes et trouvez de nouveaux clients</p>
      </div>

      <DriverProfile />

      <DriverTabs 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        myOffersCount={myOffers.length}
      />

      {renderTabContent()}

      <CounterOfferDialog
        isOpen={showCounterOfferDialog}
        onClose={() => setShowCounterOfferDialog(false)}
        counterOffer={counterOffer}
        setCounterOffer={setCounterOffer}
        onSubmit={submitCounterOffer}
      />

      <DriverStats />
    </div>
  );
};

export default DriverService;
