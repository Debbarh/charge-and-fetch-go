import React, { useEffect, useState } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Rating {
  id: string;
  overall_rating: number;
  punctuality_rating: number | null;
  communication_rating: number | null;
  vehicle_condition_rating: number | null;
  professionalism_rating: number | null;
  comment: string | null;
  created_at: string;
}

interface DriverRatingsProps {
  driverId: string;
}

const DriverRatings = ({ driverId }: DriverRatingsProps) => {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRatings();
  }, [driverId]);

  const loadRatings = async () => {
    try {
      const { data, error } = await supabase
        .from('ratings')
        .select('*')
        .eq('driver_id', driverId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setRatings(data || []);
    } catch (error) {
      console.error('Erreur chargement évaluations:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const renderDetailedRating = (label: string, rating: number | null) => {
    if (!rating) return null;
    return (
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        {renderStars(rating)}
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Chargement des évaluations...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-400" />
          Évaluations clients ({ratings.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px]">
          <div className="space-y-4">
            {ratings.length === 0 ? (
              <div className="text-center py-8">
                <Star className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Aucune évaluation pour le moment</p>
              </div>
            ) : (
              ratings.map((rating) => (
                <Card key={rating.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">Client</p>
                          <Badge variant="secondary">
                            {rating.overall_rating}/5
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(rating.created_at), {
                            addSuffix: true,
                            locale: fr
                          })}
                        </p>
                      </div>

                      {/* Overall rating */}
                      <div className="flex items-center gap-2">
                        {renderStars(rating.overall_rating)}
                      </div>

                      {/* Detailed ratings */}
                      {(rating.punctuality_rating || 
                        rating.communication_rating || 
                        rating.vehicle_condition_rating || 
                        rating.professionalism_rating) && (
                        <>
                          <Separator />
                          <div className="space-y-2">
                            {renderDetailedRating('Ponctualité', rating.punctuality_rating)}
                            {renderDetailedRating('Communication', rating.communication_rating)}
                            {renderDetailedRating('État véhicule', rating.vehicle_condition_rating)}
                            {renderDetailedRating('Professionnalisme', rating.professionalism_rating)}
                          </div>
                        </>
                      )}

                      {/* Comment */}
                      {rating.comment && (
                        <>
                          <Separator />
                          <div className="flex gap-2">
                            <MessageSquare className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                            <p className="text-sm text-muted-foreground italic">
                              "{rating.comment}"
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default DriverRatings;
