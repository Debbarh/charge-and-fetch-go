import React, { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const MessageNotificationListener = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('message-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`
        },
        async (payload) => {
          const message = payload.new;
          
          // Récupérer le nom de l'expéditeur
          const { data: senderProfile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', message.sender_id)
            .single();

          const senderName = senderProfile?.full_name || 'Un utilisateur';

          // Afficher une notification toast
          toast.info(`Nouveau message de ${senderName}`, {
            description: message.content.length > 50 
              ? message.content.substring(0, 50) + '...' 
              : message.content,
            duration: 5000
          });

          // Notification push si supporté
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`Message de ${senderName}`, {
              body: message.content,
              icon: '/favicon.ico',
              tag: message.conversation_id
            });
          }
        }
      )
      .subscribe();

    // Demander la permission pour les notifications push
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return null;
};

export default MessageNotificationListener;
