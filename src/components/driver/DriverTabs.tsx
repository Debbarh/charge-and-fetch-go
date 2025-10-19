
import React from 'react';
import { Users, Wallet } from 'lucide-react';

interface DriverTabsProps {
  activeTab: 'available' | 'client_requests' | 'my_offers' | 'network' | 'wallet';
  setActiveTab: (tab: 'available' | 'client_requests' | 'my_offers' | 'network' | 'wallet') => void;
  myOffersCount: number;
}

const DriverTabs: React.FC<DriverTabsProps> = ({ activeTab, setActiveTab, myOffersCount }) => {
  return (
    <div className="grid grid-cols-5 gap-1 bg-gray-100 p-1 rounded-lg">
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
    </div>
  );
};

export default DriverTabs;
