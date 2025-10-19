import React, { useEffect, useState } from 'react';
import { Trophy, Star, TrendingUp, Award } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

const TopDriversLeaderboard = () => {
  const [topDrivers, setTopDrivers] = useState<TopDriver[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTopDrivers = async () => {
      try {
        setIsLoading(true);
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
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Chargement du classement...</p>
        </CardContent>
      </Card>
    );
  }

  if (topDrivers.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Aucun chauffeur classé pour le moment</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-electric-50 to-blue-50 border-electric-200">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-500" />
          <CardTitle className="text-electric-800">Top Chauffeurs</CardTitle>
        </div>
        <CardDescription>Les meilleurs chauffeurs de la plateforme</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topDrivers.map((driver, index) => (
            <div
              key={driver.driver_id}
              className={`bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all ${
                index === 0 ? 'ring-2 ring-yellow-400' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Position */}
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-white ${
                    index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                    index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                    index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                    'bg-gradient-to-br from-electric-400 to-electric-600'
                  }`}>
                    {index === 0 && <Trophy className="h-5 w-5" />}
                    {index === 1 && <Award className="h-5 w-5" />}
                    {index === 2 && <TrendingUp className="h-5 w-5" />}
                    {index > 2 && <span>{index + 1}</span>}
                  </div>

                  {/* Info chauffeur */}
                  <div>
                    <h4 className="font-semibold text-foreground">
                      {driver.driver_name || 'Chauffeur'}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-bold text-electric-600">
                          {parseFloat(driver.average_rating.toString()).toFixed(2)}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        ({driver.total_ratings} avis)
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {driver.completed_rides} courses
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Badges de détails */}
                <div className="flex flex-col items-end gap-1">
                  {driver.avg_punctuality > 0 && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <span>⏱️</span>
                      <span>{parseFloat(driver.avg_punctuality.toString()).toFixed(1)}/5</span>
                    </div>
                  )}
                  {driver.avg_communication > 0 && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <span>💬</span>
                      <span>{parseFloat(driver.avg_communication.toString()).toFixed(1)}/5</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Barre de progression */}
              <div className="mt-3">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                      'bg-gradient-to-r from-electric-400 to-electric-600'
                    }`}
                    style={{ width: `${(parseFloat(driver.average_rating.toString()) / 5) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {topDrivers.length < 10 && (
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Il faut au moins 3 évaluations pour apparaître dans le classement
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TopDriversLeaderboard;
