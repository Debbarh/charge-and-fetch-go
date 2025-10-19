import React, { useEffect, useState } from 'react';
import { Star, TrendingUp, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface TopDriver {
  driver_id: string;
  driver_name: string;
  average_rating: number;
  total_ratings: number;
  completed_rides: number;
  avg_punctuality: number;
  avg_communication: number;
  avg_vehicle_condition: number;
  avg_professionalism: number;
}

const TopDrivers = () => {
  const [topDrivers, setTopDrivers] = useState<TopDriver[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTopDrivers = async () => {
      try {
        const { data, error } = await supabase
          .from('top_drivers')
          .select('*');

        if (error) throw error;

        if (data) {
          setTopDrivers(data);
        }
      } catch (error) {
        console.error('Erreur chargement top chauffeurs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTopDrivers();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Chargement...</p>
        </CardContent>
      </Card>
    );
  }

  if (topDrivers.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Aucune évaluation disponible pour le moment
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-electric-50 to-blue-50 border-electric-200">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5 text-electric-600" />
          <CardTitle className="text-electric-800">Meilleurs Chauffeurs</CardTitle>
          <Badge variant="outline" className="ml-auto">
            Top {topDrivers.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {topDrivers.map((driver, index) => (
          <div
            key={driver.driver_id}
            className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  index === 0 ? 'bg-yellow-100 text-yellow-700' :
                  index === 1 ? 'bg-gray-100 text-gray-700' :
                  index === 2 ? 'bg-orange-100 text-orange-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  <span className="font-bold">{index + 1}</span>
                </div>
                
                <div>
                  <div className="font-medium text-foreground">
                    {driver.driver_name || 'Chauffeur'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {driver.completed_rides} courses • {driver.total_ratings} avis
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  <span className="font-bold text-lg">
                    {parseFloat(driver.average_rating?.toString() || '0').toFixed(1)}
                  </span>
                </div>
                
                {index < 3 && (
                  <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                    <TrendingUp className="h-3 w-3" />
                    <span>Excellence</span>
                  </div>
                )}
              </div>
            </div>

            {/* Détails des catégories pour le top 3 */}
            {index < 3 && (
              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t">
                <div className="text-xs">
                  <span className="text-muted-foreground">Ponctualité:</span>
                  <span className="ml-1 font-medium">
                    {parseFloat(driver.avg_punctuality?.toString() || '0').toFixed(1)}/5
                  </span>
                </div>
                <div className="text-xs">
                  <span className="text-muted-foreground">Communication:</span>
                  <span className="ml-1 font-medium">
                    {parseFloat(driver.avg_communication?.toString() || '0').toFixed(1)}/5
                  </span>
                </div>
                <div className="text-xs">
                  <span className="text-muted-foreground">Véhicule:</span>
                  <span className="ml-1 font-medium">
                    {parseFloat(driver.avg_vehicle_condition?.toString() || '0').toFixed(1)}/5
                  </span>
                </div>
                <div className="text-xs">
                  <span className="text-muted-foreground">Professionnalisme:</span>
                  <span className="ml-1 font-medium">
                    {parseFloat(driver.avg_professionalism?.toString() || '0').toFixed(1)}/5
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default TopDrivers;
