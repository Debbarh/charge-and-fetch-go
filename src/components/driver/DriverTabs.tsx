
import React from 'react';
import { Users, Wallet, Star, Navigation } from 'lucide-react';

interface DriverTabsProps {
  activeTab: 'available' | 'client_requests' | 'my_offers' | 'network' | 'wallet' | 'ratings' | 'active_rides';
  setActiveTab: (tab: 'available' | 'client_requests' | 'my_offers' | 'network' | 'wallet' | 'ratings' | 'active_rides') => void;
  myOffersCount: number;
}

const DriverTabs: React.FC<DriverTabsProps> = ({ activeTab, setActiveTab, myOffersCount }) => {
  return (
    <div className="grid grid-cols-7 gap-1 bg-gray-100 p-1 rounded-lg">
      <button
        onClick={() => setActiveTab('available')}
        className={`py-2 px-2 rounded-md text-xs font-medium transition-colors ${
          activeTab === 'available'
            ? 'bg-white text-electric-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Demandes
      </button>
      <button
        onClick={() => setActiveTab('client_requests')}
        className={`py-2 px-2 rounded-md text-xs font-medium transition-colors ${
          activeTab === 'client_requests'
            ? 'bg-white text-electric-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Clients
      </button>
      <button
        onClick={() => setActiveTab('my_offers')}
        className={`py-2 px-2 rounded-md text-xs font-medium transition-colors ${
          activeTab === 'my_offers'
            ? 'bg-white text-electric-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Offres ({myOffersCount})
      </button>
      <button
        onClick={() => setActiveTab('network')}
        className={`py-2 px-2 rounded-md text-xs font-medium transition-colors ${
          activeTab === 'network'
            ? 'bg-white text-electric-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <Users className="h-4 w-4 inline mr-1" />
        Réseau
      </button>
      <button
        onClick={() => setActiveTab('wallet')}
        className={`py-2 px-2 rounded-md text-xs font-medium transition-colors ${
          activeTab === 'wallet'
            ? 'bg-white text-electric-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <Wallet className="h-4 w-4 inline mr-1" />
        Gains
      </button>
      <button
        onClick={() => setActiveTab('ratings')}
        className={`py-2 px-2 rounded-md text-xs font-medium transition-colors ${
          activeTab === 'ratings'
            ? 'bg-white text-electric-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <Star className="h-4 w-4 inline mr-1" />
        Notes
      </button>
      <button
        onClick={() => setActiveTab('active_rides')}
        className={`py-2 px-2 rounded-md text-xs font-medium transition-colors ${
          activeTab === 'active_rides'
            ? 'bg-white text-electric-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <Navigation className="h-4 w-4 inline mr-1" />
        Courses
      </button>
    </div>
  );
};

export default DriverTabs;
