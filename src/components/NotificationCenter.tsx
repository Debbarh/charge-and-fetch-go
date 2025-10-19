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
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  data: any;
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

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setNotifications(data || []);
      setUnreadCount((data || []).filter(n => !n.read).length);
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
    }
  };

  const subscribeToRealtime = () => {
    if (!user) return;

    const channel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newNotif = payload.new as Notification;
          
          setNotifications(prev => [newNotif, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // Show toast notification
          const notifType = newNotif.type;
          if (notifType === 'new_offer') {
            toast.success(newNotif.title, {
              description: newNotif.message
            });
          } else if (notifType === 'negotiation') {
            toast.info(newNotif.title, {
              description: newNotif.message
            });
          } else if (notifType === 'rating') {
            toast.success(newNotif.title, {
              description: newNotif.message
            });
          } else {
            toast(newNotif.title, {
              description: newNotif.message
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markAsRead = async (notifId: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notifId);

      setNotifications(prev =>
        prev.map(n => n.id === notifId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Erreur marquage notification:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Erreur marquage notifications:', error);
    }
  };

  const deleteNotification = async (notifId: string) => {
    try {
      await supabase
        .from('notifications')
        .delete()
        .eq('id', notifId);

      setNotifications(prev => prev.filter(n => n.id !== notifId));
      const wasUnread = notifications.find(n => n.id === notifId)?.read === false;
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Erreur suppression notification:', error);
    }
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
                  className={`transition-all hover:shadow-md ${
                    !notif.read ? 'bg-electric-50 border-electric-200' : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">{getNotificationIcon(notif.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h4 className="font-semibold text-sm truncate">
                            {notif.title}
                          </h4>
                          <div className="flex items-center gap-1">
                            {!notif.read && (
                              <Badge variant="default" className="bg-electric-500 text-xs">
                                Nouveau
                              </Badge>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notif.id);
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notif.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(notif.created_at), {
                              addSuffix: true,
                              locale: fr
                            })}
                          </p>
                          {!notif.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs h-6"
                              onClick={() => markAsRead(notif.id)}
                            >
                              Marquer comme lu
                            </Button>
                          )}
                        </div>
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
