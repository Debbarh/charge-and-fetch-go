import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, Users, Star } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const AdminCharts = () => {
  const [requestsData, setRequestsData] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadChartData();
  }, []);

  const loadChartData = async () => {
    try {
      // Données des demandes par jour (7 derniers jours)
      const { data: requests, error: reqError } = await supabase
        .from('requests')
        .select('created_at, status')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (reqError) throw reqError;

      // Grouper par jour
      const requestsByDay = requests.reduce((acc: any, req: any) => {
        const date = new Date(req.created_at).toLocaleDateString('fr-FR', { weekday: 'short' });
        if (!acc[date]) {
          acc[date] = { date, total: 0, active: 0, completed: 0 };
        }
        acc[date].total++;
        if (req.status === 'active') acc[date].active++;
        if (req.status === 'driver_selected') acc[date].completed++;
        return acc;
      }, {});

      setRequestsData(Object.values(requestsByDay));

      // Données de revenus
      const { data: transactions, error: transError } = await supabase
        .from('transactions')
        .select('amount, created_at, payment_status')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (transError) throw transError;

      const revenueByDay = transactions.reduce((acc: any, trans: any) => {
        const date = new Date(trans.created_at).toLocaleDateString('fr-FR', { weekday: 'short' });
        if (!acc[date]) {
          acc[date] = { date, revenue: 0 };
        }
        if (trans.payment_status === 'paid') {
          acc[date].revenue += Number(trans.amount);
        }
        return acc;
      }, {});

      setRevenueData(Object.values(revenueByDay));

    } catch (error: any) {
      console.error('Erreur chargement graphiques:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de charger les graphiques'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-64 bg-muted rounded"></div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Graphique des demandes */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold">Demandes (7 derniers jours)</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={requestsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="#3b82f6" name="Total" />
              <Bar dataKey="active" fill="#10b981" name="Actives" />
              <Bar dataKey="completed" fill="#8b5cf6" name="Terminées" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Graphique des revenus */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="h-5 w-5 text-green-600" />
            <h3 className="font-semibold">Revenus (7 derniers jours)</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Revenus (€)"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};

export default AdminCharts;
