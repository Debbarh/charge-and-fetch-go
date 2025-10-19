import React, { useEffect, useState } from 'react';
import { Bell, X, CheckCircle, AlertCircle, MessageSquare, Star, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Notification {
  id: string;
  type: 'new_offer' | 'negotiation' | 'status_change' | 'rating' | 'request_selected';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  data?: any;
}

const NotificationCenter = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    loadNotifications();
    subscribeToRealtime();
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;

    const notifs: Notification[] = [];

    try {
      // Check for new offers on user's requests
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!userRole || userRole.role !== 'chauffeur') {
        const { data: requests } = await supabase
          .from('requests')
          .select('id, pickup_address, created_at')
          .eq('user_id', user.id)
          .eq('status', 'active');

        if (requests) {
          for (const request of requests) {
            const { data: offers } = await supabase
              .from('driver_offers')
              .select('*, created_at')
              .eq('request_id', request.id)
              .order('created_at', { ascending: false })
              .limit(5);

            offers?.forEach(offer => {
              notifs.push({
                id: `offer-${offer.id}`,
                type: 'new_offer',
                title: 'Nouvelle offre reçue',
                message: `${offer.driver_name} a proposé ${offer.proposed_price}€ pour ${request.pickup_address}`,
                read: false,
                created_at: offer.created_at,
                data: { offerId: offer.id, requestId: request.id }
              });
            });
          }
        }
      }

      // Check for new negotiations
      const { data: offers } = await supabase
        .from('driver_offers')
        .select('id, request_id, driver_id')
        .eq('driver_id', user.id);

      if (offers) {
        for (const offer of offers) {
          const { data: negotiations } = await supabase
            .from('negotiations')
            .select('*, created_at')
            .eq('offer_id', offer.id)
            .order('created_at', { ascending: false })
            .limit(3);

          negotiations?.forEach(nego => {
            if (nego.from_user_id !== user.id) {
              notifs.push({
                id: `nego-${nego.id}`,
                type: 'negotiation',
                title: 'Nouvelle négociation',
                message: `Contre-offre: ${nego.proposed_price}€ - ${nego.message}`,
                read: false,
                created_at: nego.created_at,
                data: { negotiationId: nego.id, offerId: offer.id }
              });
            }
          });
        }
      }

      // Sort by date and limit
      notifs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setNotifications(notifs.slice(0, 20));
      setUnreadCount(notifs.filter(n => !n.read).length);
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
    }
  };

  const subscribeToRealtime = () => {
    if (!user) return;

    // Subscribe to new offers
    const offersChannel = supabase
      .channel('new-offers')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'driver_offers'
        },
        async (payload) => {
          const offer = payload.new as any;
          
          // Check if this offer is for user's request
          const { data: request } = await supabase
            .from('requests')
            .select('pickup_address')
            .eq('id', offer.request_id)
            .eq('user_id', user.id)
            .maybeSingle();

          if (request) {
            const newNotif: Notification = {
              id: `offer-${offer.id}`,
              type: 'new_offer',
              title: 'Nouvelle offre reçue',
              message: `${offer.driver_name} a proposé ${offer.proposed_price}€ pour ${request.pickup_address}`,
              read: false,
              created_at: offer.created_at,
              data: { offerId: offer.id, requestId: offer.request_id }
            };

            setNotifications(prev => [newNotif, ...prev]);
            setUnreadCount(prev => prev + 1);
            
            toast.success('Nouvelle offre reçue!', {
              description: `${offer.driver_name} - ${offer.proposed_price}€`
            });
          }
        }
      )
      .subscribe();

    // Subscribe to negotiations
    const negotiationsChannel = supabase
      .channel('negotiations')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'negotiations'
        },
        async (payload) => {
          const nego = payload.new as any;
          
          if (nego.from_user_id !== user.id) {
            const newNotif: Notification = {
              id: `nego-${nego.id}`,
              type: 'negotiation',
              title: 'Nouvelle négociation',
              message: `Contre-offre: ${nego.proposed_price}€`,
              read: false,
              created_at: nego.created_at,
              data: { negotiationId: nego.id, offerId: nego.offer_id }
            };

            setNotifications(prev => [newNotif, ...prev]);
            setUnreadCount(prev => prev + 1);
            
            toast.info('Nouvelle négociation', {
              description: nego.message
            });
          }
        }
      )
      .subscribe();

    // Subscribe to ratings
    const ratingsChannel = supabase
      .channel('ratings')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ratings'
        },
        async (payload) => {
          const rating = payload.new as any;
          
          if (rating.driver_id === user.id) {
            const newNotif: Notification = {
              id: `rating-${rating.id}`,
              type: 'rating',
              title: 'Nouvelle évaluation',
              message: `Vous avez reçu ${rating.overall_rating}/5 étoiles`,
              read: false,
              created_at: rating.created_at,
              data: { ratingId: rating.id }
            };

            setNotifications(prev => [newNotif, ...prev]);
            setUnreadCount(prev => prev + 1);
            
            toast.success('Nouvelle évaluation!', {
              description: `${rating.overall_rating}/5 étoiles`
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(offersChannel);
      supabase.removeChannel(negotiationsChannel);
      supabase.removeChannel(ratingsChannel);
    };
  };

  const markAsRead = (notifId: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === notifId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'new_offer':
        return <TrendingUp className="h-4 w-4 text-electric-600" />;
      case 'negotiation':
        return <MessageSquare className="h-4 w-4 text-blue-600" />;
      case 'rating':
        return <Star className="h-4 w-4 text-yellow-600" />;
      case 'status_change':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs"
              >
                Tout marquer comme lu
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-8rem)] mt-4">
          <div className="space-y-2">
            {notifications.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Aucune notification</p>
                </CardContent>
              </Card>
            ) : (
              notifications.map((notif) => (
                <Card
                  key={notif.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    !notif.read ? 'bg-electric-50 border-electric-200' : ''
                  }`}
                  onClick={() => markAsRead(notif.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">{getNotificationIcon(notif.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h4 className="font-semibold text-sm truncate">
                            {notif.title}
                          </h4>
                          {!notif.read && (
                            <Badge variant="default" className="bg-electric-500 text-xs">
                              Nouveau
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notif.message}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notif.created_at), {
                            addSuffix: true,
                            locale: fr
                          })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default NotificationCenter;
