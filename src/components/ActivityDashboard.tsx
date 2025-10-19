import React, { useEffect, useState } from 'react';
import { Clock, TrendingUp, CheckCircle, XCircle, Euro, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Activity {
  id: string;
  type: 'offer_sent' | 'offer_received' | 'request_completed' | 'rating_received' | 'negotiation';
  title: string;
  description: string;
  timestamp: string;
  status?: 'success' | 'pending' | 'cancelled';
  amount?: number;
}

interface Stats {
  totalRequests: number;
  activeRequests: number;
  completedRequests: number;
  totalEarnings: number;
  averageRating: number;
  totalRatings: number;
}

const ActivityDashboard = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalRequests: 0,
    activeRequests: 0,
    completedRequests: 0,
    totalEarnings: 0,
    averageRating: 0,
    totalRatings: 0
  });
  const [isDriver, setIsDriver] = useState(false);

  useEffect(() => {
    if (user) {
      checkUserRole();
      loadActivities();
      loadStats();
    }
  }, [user]);

  const checkUserRole = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'chauffeur')
      .maybeSingle();

    setIsDriver(!!data);
  };

  const loadActivities = async () => {
    if (!user) return;

    const activitiesList: Activity[] = [];

    try {
      if (isDriver) {
        // Driver activities
        const { data: offers } = await supabase
          .from('driver_offers')
          .select('*, requests(pickup_address, destination_address)')
          .eq('driver_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        offers?.forEach(offer => {
          activitiesList.push({
            id: `offer-${offer.id}`,
            type: 'offer_sent',
            title: 'Offre envoyée',
            description: `${offer.proposed_price}€ pour ${(offer as any).requests?.pickup_address || 'une course'}`,
            timestamp: offer.created_at,
            status: offer.status === 'accepted' ? 'success' : offer.status === 'rejected' ? 'cancelled' : 'pending',
            amount: parseFloat(offer.proposed_price.toString())
          });
        });

        // Ratings received
        const { data: ratings } = await supabase
          .from('ratings')
          .select('*')
          .eq('driver_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        ratings?.forEach(rating => {
          activitiesList.push({
            id: `rating-${rating.id}`,
            type: 'rating_received',
            title: 'Évaluation reçue',
            description: `${rating.overall_rating}/5 étoiles - ${rating.comment || 'Sans commentaire'}`,
            timestamp: rating.created_at,
            status: 'success'
          });
        });
      } else {
        // Client activities
        const { data: requests } = await supabase
          .from('requests')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        requests?.forEach(request => {
          activitiesList.push({
            id: `request-${request.id}`,
            type: request.status === 'completed' ? 'request_completed' : 'offer_received',
            title: request.status === 'completed' ? 'Course terminée' : 'Demande créée',
            description: `${request.pickup_address} → ${request.destination_address || 'Destination'}`,
            timestamp: request.created_at,
            status: request.status === 'completed' ? 'success' : request.status === 'cancelled' ? 'cancelled' : 'pending',
            amount: parseFloat(request.proposed_price.toString())
          });
        });
      }

      activitiesList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setActivities(activitiesList.slice(0, 15));
    } catch (error) {
      console.error('Erreur chargement activités:', error);
    }
  };

  const loadStats = async () => {
    if (!user) return;

    try {
      if (isDriver) {
        // Driver stats
        const { data: driverStats } = await supabase
          .from('driver_stats')
          .select('*')
          .eq('driver_id', user.id)
          .maybeSingle();

        if (driverStats) {
          setStats({
            totalRequests: driverStats.total_rides,
            activeRequests: 0,
            completedRequests: driverStats.completed_rides,
            totalEarnings: parseFloat(driverStats.total_revenue?.toString() || '0'),
            averageRating: parseFloat(driverStats.average_rating?.toString() || '0'),
            totalRatings: driverStats.total_ratings
          });
        }
      } else {
        // Client stats
        const { data: requests } = await supabase
          .from('requests')
          .select('status, proposed_price')
          .eq('user_id', user.id);

        if (requests) {
          const completed = requests.filter(r => r.status === 'completed');
          const active = requests.filter(r => r.status === 'active');
          const totalSpent = completed.reduce((sum, r) => sum + parseFloat(r.proposed_price.toString()), 0);

          setStats({
            totalRequests: requests.length,
            activeRequests: active.length,
            completedRequests: completed.length,
            totalEarnings: totalSpent,
            averageRating: 0,
            totalRatings: 0
          });
        }
      }
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    }
  };

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'offer_sent':
      case 'offer_received':
        return <TrendingUp className="h-4 w-4 text-electric-600" />;
      case 'request_completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rating_received':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status?: Activity['status']) => {
    if (!status) return null;
    
    const variants = {
      success: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      cancelled: 'bg-red-100 text-red-700'
    };

    const labels = {
      success: 'Terminé',
      pending: 'En cours',
      cancelled: 'Annulé'
    };

    return (
      <Badge className={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {isDriver ? 'Courses totales' : 'Demandes totales'}
                </p>
                <p className="text-2xl font-bold text-foreground">{stats.totalRequests}</p>
              </div>
              <Calendar className="h-8 w-8 text-electric-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {isDriver ? 'En cours' : 'Actives'}
                </p>
                <p className="text-2xl font-bold text-foreground">{stats.activeRequests}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Terminées</p>
                <p className="text-2xl font-bold text-foreground">{stats.completedRequests}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {isDriver ? 'Gains totaux' : 'Dépenses totales'}
                </p>
                <p className="text-2xl font-bold text-electric-600">{stats.totalEarnings.toFixed(2)}€</p>
              </div>
              <Euro className="h-8 w-8 text-electric-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Activité récente</CardTitle>
          <CardDescription>Votre historique d'activités</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activities.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Aucune activité récente
              </p>
            ) : (
              activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="mt-1">{getActivityIcon(activity.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="font-medium text-sm">{activity.title}</h4>
                      {getStatusBadge(activity.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>
                        {formatDistanceToNow(new Date(activity.timestamp), {
                          addSuffix: true,
                          locale: fr
                        })}
                      </span>
                      {activity.amount && (
                        <span className="font-medium text-electric-600">
                          {activity.amount.toFixed(2)}€
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityDashboard;
