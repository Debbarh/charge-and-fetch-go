import React, { useEffect, useState } from 'react';
import { Wallet, TrendingUp, DollarSign, Download, Calendar, CreditCard, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface WalletData {
  balance: number;
  pending_balance: number;
  total_earned: number;
  total_withdrawn: number;
  last_payout_at: string | null;
}

interface Transaction {
  id: string;
  amount: number;
  payment_method: string;
  payment_status: string;
  transaction_type: string;
  description: string;
  paid_at: string | null;
  created_at: string;
  request_id: string | null;
}

const WalletManagement = () => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadWalletData();
      loadTransactions();
      subscribeToUpdates();
    }
  }, [user]);

  const loadWalletData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('driver_wallets')
        .select('*')
        .eq('driver_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setWallet({
          balance: parseFloat(data.balance.toString()),
          pending_balance: parseFloat(data.pending_balance.toString()),
          total_earned: parseFloat(data.total_earned.toString()),
          total_withdrawn: parseFloat(data.total_withdrawn.toString()),
          last_payout_at: data.last_payout_at
        });
      } else {
        // Create wallet if doesn't exist
        const { data: newWallet, error: createError } = await supabase
          .from('driver_wallets')
          .insert({ driver_id: user.id })
          .select()
          .single();

        if (createError) throw createError;

        setWallet({
          balance: 0,
          pending_balance: 0,
          total_earned: 0,
          total_withdrawn: 0,
          last_payout_at: null
        });
      }
    } catch (error) {
      console.error('Erreur chargement portefeuille:', error);
      toast.error('Impossible de charger le portefeuille');
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('driver_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setTransactions(data || []);
    } catch (error) {
      console.error('Erreur chargement transactions:', error);
    }
  };

  const subscribeToUpdates = () => {
    if (!user) return;

    const channel = supabase
      .channel('wallet-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'driver_wallets',
          filter: `driver_id=eq.${user.id}`
        },
        () => {
          loadWalletData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
          filter: `driver_id=eq.${user.id}`
        },
        () => {
          loadTransactions();
          toast.success('Nouveau paiement reçu !');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const requestPayout = async () => {
    if (!user || !wallet || wallet.balance < 10) {
      toast.error('Solde insuffisant', {
        description: 'Le montant minimum de retrait est de 10€'
      });
      return;
    }

    try {
      // TODO: Implémenter la logique de paiement réelle
      toast.success('Demande de retrait envoyée', {
        description: `${wallet.balance}€ seront transférés sous 2-3 jours ouvrés`
      });
    } catch (error) {
      console.error('Erreur demande retrait:', error);
      toast.error('Impossible de traiter la demande');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'En attente' },
      completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Payé' },
      failed: { bg: 'bg-red-100', text: 'text-red-700', label: 'Échoué' }
    };

    const variant = variants[status as keyof typeof variants] || variants.pending;
    return (
      <Badge className={`${variant.bg} ${variant.text}`}>
        {variant.label}
      </Badge>
    );
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'card':
        return <CreditCard className="h-4 w-4" />;
      case 'cash':
        return <DollarSign className="h-4 w-4" />;
      default:
        return <Wallet className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Chargement du portefeuille...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Erreur de chargement du portefeuille</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-electric-500 to-electric-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-electric-100 text-sm mb-1">Solde disponible</p>
                <p className="text-3xl font-bold">{wallet.balance.toFixed(2)}€</p>
              </div>
              <Wallet className="h-12 w-12 text-electric-200" />
            </div>
            <Button
              onClick={requestPayout}
              disabled={wallet.balance < 10}
              className="w-full mt-4 bg-white text-electric-600 hover:bg-electric-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Retirer
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm mb-1">En attente</p>
                <p className="text-2xl font-bold text-orange-600">{wallet.pending_balance.toFixed(2)}€</p>
              </div>
              <Clock className="h-10 w-10 text-orange-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Disponible après validation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm mb-1">Total gagné</p>
                <p className="text-2xl font-bold text-green-600">{wallet.total_earned.toFixed(2)}€</p>
              </div>
              <TrendingUp className="h-10 w-10 text-green-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Depuis le début
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Stats */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Retraits</p>
              <p className="text-xl font-bold">{wallet.total_withdrawn.toFixed(2)}€</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Commissions</p>
              <p className="text-xl font-bold">{(wallet.total_earned * 0.1).toFixed(2)}€</p>
              <p className="text-xs text-muted-foreground">(10%)</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Net perçu</p>
              <p className="text-xl font-bold text-green-600">
                {(wallet.total_earned * 0.9).toFixed(2)}€
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Dernier retrait</p>
              <p className="text-sm font-medium">
                {wallet.last_payout_at 
                  ? new Date(wallet.last_payout_at).toLocaleDateString('fr-FR')
                  : 'Aucun'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-electric-600" />
            Historique des transactions
          </CardTitle>
          <CardDescription>
            Consultez l'historique de vos paiements et revenus
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {transactions.length === 0 ? (
                <div className="text-center py-8">
                  <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Aucune transaction</p>
                </div>
              ) : (
                transactions.map((transaction) => (
                  <Card key={transaction.id} className="hover:shadow-md transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          {getPaymentMethodIcon(transaction.payment_method)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-sm">
                                {transaction.description || 'Service valet'}
                              </p>
                              {getStatusBadge(transaction.payment_status)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(transaction.created_at), {
                                addSuffix: true,
                                locale: fr
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">
                            +{transaction.amount.toFixed(2)}€
                          </p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {transaction.payment_method}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="font-medium text-blue-800 mb-2">💡 Informations de paiement</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Montant minimum de retrait: 10€</li>
            <li>• Commission plateforme: 10% par transaction</li>
            <li>• Délai de transfert: 2-3 jours ouvrés</li>
            <li>• Les paiements en attente sont validés après fin de course</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletManagement;
