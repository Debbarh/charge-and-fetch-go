import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Search, Download, Users, Star, TrendingUp, Ban } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Driver {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  vehicle_make: string;
  vehicle_model: string;
  experience_years: number;
  hourly_rate: number;
  total_rides: number;
  completed_rides: number;
  average_rating: number;
  total_ratings: number;
}

const DriversManagement = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers = async () => {
    try {
      // Récupérer tous les utilisateurs avec le rôle chauffeur
      const { data: driverRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'chauffeur');

      if (rolesError) throw rolesError;

      const driverIds = driverRoles.map(r => r.user_id);

      if (driverIds.length === 0) {
        setDrivers([]);
        setLoading(false);
        return;
      }

      // Récupérer les profils
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', driverIds);

      if (profilesError) throw profilesError;

      // Récupérer les stats
      const { data: stats, error: statsError } = await supabase
        .from('driver_stats')
        .select('*')
        .in('driver_id', driverIds);

      if (statsError) throw statsError;

      // Récupérer les emails depuis auth.users (via une vue ou fonction si nécessaire)
      // Pour l'instant on va juste utiliser les profils
      const driversData = profiles.map(profile => {
        const driverStat = stats?.find(s => s.driver_id === profile.id);
        return {
          id: profile.id,
          full_name: profile.full_name || 'Sans nom',
          email: 'N/A', // On n'a pas accès direct à auth.users
          phone: profile.phone || 'N/A',
          vehicle_make: profile.vehicle_make || 'N/A',
          vehicle_model: profile.vehicle_model || 'N/A',
          experience_years: profile.experience_years || 0,
          hourly_rate: profile.hourly_rate || 0,
          total_rides: driverStat?.total_rides || 0,
          completed_rides: driverStat?.completed_rides || 0,
          average_rating: driverStat?.average_rating || 0,
          total_ratings: driverStat?.total_ratings || 0,
        };
      });

      setDrivers(driversData);
    } catch (error: any) {
      console.error('Erreur chargement chauffeurs:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de charger les chauffeurs'
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Nom', 'Téléphone', 'Véhicule', 'Expérience', 'Tarif', 'Courses', 'Note'];
    const rows = filteredDrivers.map(d => [
      d.full_name,
      d.phone,
      `${d.vehicle_make} ${d.vehicle_model}`,
      `${d.experience_years} ans`,
      `${d.hourly_rate}€/h`,
      `${d.completed_rides}/${d.total_rides}`,
      d.average_rating.toFixed(1)
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chauffeurs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();

    toast({
      title: 'Export réussi',
      description: `${filteredDrivers.length} chauffeurs exportés`
    });
  };

  const filteredDrivers = drivers.filter(driver =>
    driver.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${driver.vehicle_make} ${driver.vehicle_model}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-20 bg-muted rounded"></div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec recherche et export */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, téléphone ou véhicule..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportToCSV} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-muted-foreground">Total chauffeurs</p>
              <p className="text-2xl font-bold">{drivers.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-muted-foreground">Courses totales</p>
              <p className="text-2xl font-bold">
                {drivers.reduce((acc, d) => acc + d.completed_rides, 0)}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Star className="h-8 w-8 text-yellow-600" />
            <div>
              <p className="text-sm text-muted-foreground">Note moyenne</p>
              <p className="text-2xl font-bold">
                {drivers.length > 0
                  ? (drivers.reduce((acc, d) => acc + d.average_rating, 0) / drivers.length).toFixed(1)
                  : '0.0'
                }
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Search className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-sm text-muted-foreground">Résultats</p>
              <p className="text-2xl font-bold">{filteredDrivers.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Liste des chauffeurs */}
      <div className="space-y-4">
        {filteredDrivers.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Aucun chauffeur trouvé</p>
          </Card>
        ) : (
          filteredDrivers.map(driver => (
            <Card key={driver.id} className="p-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {driver.full_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{driver.full_name}</h3>
                      <p className="text-sm text-muted-foreground">{driver.phone}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {driver.average_rating > 0 && (
                        <Badge variant="outline" className="gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {driver.average_rating.toFixed(1)}
                          <span className="text-muted-foreground">({driver.total_ratings})</span>
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Véhicule</p>
                      <p className="font-medium">{driver.vehicle_make} {driver.vehicle_model}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Expérience</p>
                      <p className="font-medium">{driver.experience_years} ans</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Tarif</p>
                      <p className="font-medium text-primary">{driver.hourly_rate} €/h</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Courses</p>
                      <p className="font-medium">{driver.completed_rides}/{driver.total_rides}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default DriversManagement;
