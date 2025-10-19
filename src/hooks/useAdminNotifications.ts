import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAdminNotifications = (isAdmin: boolean) => {
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (!isAdmin) return;

    // Charger le compte initial
    loadPendingCount();

    // Écouter les changements en temps réel
    const channel = supabase
      .channel('admin_notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'driver_verifications'
        },
        () => {
          loadPendingCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin]);

  const loadPendingCount = async () => {
    try {
      const { data, error } = await supabase.rpc('count_pending_verifications');
      
      if (error) throw error;
      setPendingCount(data || 0);
    } catch (error) {
      console.error('Erreur chargement count:', error);
    }
  };

  return { pendingCount };
};
