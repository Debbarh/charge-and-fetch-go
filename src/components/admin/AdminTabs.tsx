import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, UserCheck, Users, BarChart3 } from 'lucide-react';
import AdminStats from './AdminStats';
import KYCManagement from './KYCManagement';
import TopDriversLeaderboard from '../TopDriversLeaderboard';

const AdminTabs = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Administration</h1>
        <p className="text-muted-foreground mt-2">Gestion de la plateforme ElectricValet</p>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="kyc" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            <span className="hidden sm:inline">KYC</span>
          </TabsTrigger>
          <TabsTrigger value="drivers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Chauffeurs</span>
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Statistiques</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6 mt-6">
          <AdminStats />
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Dernières demandes KYC</h2>
              <KYCManagement />
            </div>
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Top Chauffeurs</h2>
              <TopDriversLeaderboard />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="kyc" className="mt-6">
          <KYCManagement />
        </TabsContent>

        <TabsContent value="drivers" className="mt-6">
          <TopDriversLeaderboard />
        </TabsContent>

        <TabsContent value="stats" className="mt-6">
          <AdminStats />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminTabs;
