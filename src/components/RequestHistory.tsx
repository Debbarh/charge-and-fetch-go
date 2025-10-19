import React, { useEffect, useState } from 'react';
import { Calendar, MapPin, Car, Euro, Clock, Star, Filter, Download, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

interface RequestHistoryItem {
  id: string;
  pickup_address: string;
  destination_address: string;
  vehicle_model: string;
  proposed_price: number;
  status: 'active' | 'completed' | 'cancelled' | 'driver_selected';
  created_at: string;
  updated_at: string;
  selected_driver_id?: string;
  driver_name?: string;
  driver_rating?: number;
  urgency: 'low' | 'medium' | 'high';
}

const RequestHistory = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<RequestHistoryItem[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<RequestHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    active: 0,
    cancelled: 0,
    totalSpent: 0,
    avgPrice: 0
  });

  useEffect(() => {
    if (user) {
      loadHistory();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
    calculateStats();
  }, [requests, statusFilter]);

  const loadHistory = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('requests')
        .select(`
          *,
          driver_offers!requests_selected_driver_id_fkey(
            driver_name,
            driver_rating
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedData: RequestHistoryItem[] = (data || []).map(req => {
        const driverOffer = Array.isArray(req.driver_offers) ? req.driver_offers[0] : req.driver_offers;
        
        return {
          id: req.id,
          pickup_address: req.pickup_address,
          destination_address: req.destination_address || '',
          vehicle_model: req.vehicle_model,
          proposed_price: parseFloat(req.proposed_price.toString()),
          status: req.status,
          created_at: req.created_at,
          updated_at: req.updated_at,
          selected_driver_id: req.selected_driver_id,
          driver_name: driverOffer?.driver_name,
          driver_rating: driverOffer?.driver_rating ? parseFloat(driverOffer.driver_rating.toString()) : undefined,
          urgency: req.urgency
        };
      });

      setRequests(formattedData);
    } catch (error) {
      console.error('Erreur chargement historique:', error);
      toast.error('Impossible de charger l\'historique');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...requests];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(req => req.status === statusFilter);
    }

    setFilteredRequests(filtered);
  };

  const calculateStats = () => {
    const total = requests.length;
    const completed = requests.filter(r => r.status === 'completed').length;
    const active = requests.filter(r => r.status === 'active' || r.status === 'driver_selected').length;
    const cancelled = requests.filter(r => r.status === 'cancelled').length;
    const totalSpent = requests
      .filter(r => r.status === 'completed')
      .reduce((sum, r) => sum + r.proposed_price, 0);
    const avgPrice = completed > 0 ? totalSpent / completed : 0;

    setStats({
      total,
      completed,
      active,
      cancelled,
      totalSpent,
      avgPrice
    });
  };

  const getStatusBadge = (status: RequestHistoryItem['status']) => {
    const variants = {
      active: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Active' },
      completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Terminée' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Annulée' },
      driver_selected: { bg: 'bg-electric-100', text: 'text-electric-700', label: 'En cours' }
    };

    const variant = variants[status] || variants.active;
    return (
      <Badge className={`${variant.bg} ${variant.text}`}>
        {variant.label}
      </Badge>
    );
  };

  const getUrgencyBadge = (urgency: RequestHistoryItem['urgency']) => {
    const variants = {
      low: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Flexible' },
      medium: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Modéré' },
      high: { bg: 'bg-red-100', text: 'text-red-700', label: 'Urgent' }
    };

    const variant = variants[urgency];
    return (
      <Badge variant="outline" className={`${variant.bg} ${variant.text} text-xs`}>
        {variant.label}
      </Badge>
    );
  };

  const exportData = () => {
    const csv = [
      ['Date', 'Départ', 'Arrivée', 'Véhicule', 'Prix', 'Statut', 'Chauffeur'].join(','),
      ...filteredRequests.map(req => [
        new Date(req.created_at).toLocaleDateString('fr-FR'),
        req.pickup_address,
        req.destination_address,
        req.vehicle_model,
        `${req.proposed_price}€`,
        req.status,
        req.driver_name || 'N/A'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historique-demandes-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success('Export réussi', {
      description: 'Votre historique a été exporté en CSV'
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Chargement de l'historique...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-electric-600">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Demandes totales</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">Terminées</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">En cours</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-electric-600">{stats.totalSpent.toFixed(0)}€</div>
            <p className="text-xs text-muted-foreground">Dépensé</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Export */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-electric-600" />
                Historique des demandes
              </CardTitle>
              <CardDescription>
                Consultez toutes vos demandes de service valet
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="active">Actives</SelectItem>
                  <SelectItem value="driver_selected">En cours</SelectItem>
                  <SelectItem value="completed">Terminées</SelectItem>
                  <SelectItem value="cancelled">Annulées</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={exportData}
                disabled={filteredRequests.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-3">
              {filteredRequests.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">
                    {statusFilter === 'all' 
                      ? 'Aucune demande pour le moment' 
                      : `Aucune demande ${statusFilter === 'active' ? 'active' : statusFilter === 'completed' ? 'terminée' : 'annulée'}`
                    }
                  </p>
                </div>
              ) : (
                filteredRequests.map((request) => (
                  <Card key={request.id} className="hover:shadow-md transition-all">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          {getStatusBadge(request.status)}
                          {getUrgencyBadge(request.urgency)}
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-electric-600">
                            {request.proposed_price}€
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(request.created_at), {
                              addSuffix: true,
                              locale: fr
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-green-600 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">Départ</p>
                            <p className="text-sm text-muted-foreground">{request.pickup_address}</p>
                          </div>
                        </div>

                        {request.destination_address && (
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-red-600 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-medium">Arrivée</p>
                              <p className="text-sm text-muted-foreground">{request.destination_address}</p>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <Car className="h-4 w-4 text-electric-600" />
                          <p className="text-sm text-muted-foreground">{request.vehicle_model}</p>
                        </div>

                        {request.driver_name && (
                          <div className="flex items-center gap-2 pt-2 border-t">
                            <Users className="h-4 w-4 text-electric-600" />
                            <p className="text-sm font-medium">{request.driver_name}</p>
                            {request.driver_rating && (
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                                <span className="text-xs text-muted-foreground">
                                  {request.driver_rating.toFixed(1)}
                                </span>
                              </div>
                            )}
                          </div>
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

      {/* Additional Stats */}
      {stats.completed > 0 && (
        <Card className="bg-gradient-to-r from-electric-50 to-blue-50 border-electric-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-electric-600" />
                <div>
                  <p className="text-sm text-electric-700 font-medium">Prix moyen par course</p>
                  <p className="text-2xl font-bold text-electric-800">{stats.avgPrice.toFixed(2)}€</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-electric-600">Économies estimées</p>
                <p className="text-lg font-semibold text-electric-700">
                  {(stats.completed * 5).toFixed(0)}€
                </p>
                <p className="text-xs text-electric-600">vs services premium</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RequestHistory;
