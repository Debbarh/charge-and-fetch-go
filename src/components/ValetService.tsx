
import React from 'react';
import ClientRequestForm from './ClientRequestForm';

interface Service {
  id: number;
  name: string;
  price: string;
  rating: number;
  description: string;
}

interface ValetServiceProps {
  services: Service[];
  onBooking: () => void;
}

const ValetService: React.FC<ValetServiceProps> = ({ services, onBooking }) => {
  return <ClientRequestForm />;
};

export default ValetService;
